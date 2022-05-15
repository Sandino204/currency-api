import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoinRepository } from '../coin/coin.repository';
import { ConversionRepository } from './conversion.repository';
import { LoadConversionDto } from './dto/load-conversion.dto';
import { ConversionDto } from './dto/conversion.dto';
import { Conversion } from './conversion.entity';
import { DirectedGraph } from 'graphology';
import { bidirectional } from 'graphology-shortest-path';
import { ShortestPath } from 'graphology-shortest-path/unweighted';
import { ConversionAllResponse } from './interfaces/conversion';
import { ConversionResponse } from './interfaces/conversion-response';
import { Coin } from 'src/coin/coin.entity';

@Injectable()
export class ConversionService {
  constructor(
    private readonly coinRepository: CoinRepository,
    private readonly conversionRepository: ConversionRepository,
  ) {}

  async loadData(input: LoadConversionDto): Promise<{ success: true }> {
    const { from, to } = input;

    await this.checkIfCoinsExists({
      to,
      from,
    });

    await this.upsertConversion(input);

    return {
      success: true,
    };
  }

  async convert(input: ConversionDto): Promise<ConversionResponse> {
    const { from, to, value } = input;

    await this.checkIfCoinsExists({
      to,
      from,
    });

    const existsWhitDepthZero =
      await this.conversionRepository.findExactConversion({
        from,
        to,
      });

    if (existsWhitDepthZero !== null) {
      const result = {
        from,
        to,
        value,
        conversion: existsWhitDepthZero.conversion * value,
      };

      return result;
    }

    const allConversions = await this.conversionRepository.findAll();

    const graph = await this.graphSearch(allConversions);

    const path = await this.getPath({ graph, from, to });

    if (path === null) {
      throw new ConflictException({
        message: 'Dont have enough information to complete this conversion',
      });
    }

    let acumulator: number = value;

    for (let i = 0; i < path.length - 1; i++) {
      const change = allConversions.filter(
        (conversion) =>
          conversion.from === path[i] && conversion.to === path[i + 1],
      )[0];

      acumulator *= change.conversion;
    }

    await this.upsertConversion({
      from,
      to,
      conversion: acumulator / value,
    });

    const result = {
      from,
      to,
      value,
      conversion: acumulator,
    };

    return result;
  }

  private async checkIfCoinsExists(input: {
    from: string;
    to?: string;
  }): Promise<boolean> {
    const { from, to } = input;
    let toCoin;
    if (to) {
      toCoin = await this.coinRepository.findByCode(to);
    }
    const fromCoin = await this.coinRepository.findByCode(from);

    if (fromCoin === null) {
      throw new NotFoundException({
        message: 'from coin not found',
      });
    }

    if (toCoin === null) {
      throw new NotFoundException({
        message: 'to coin not found',
      });
    }

    return true;
  }

  private async upsertConversion(input: {
    to: string;
    from: string;
    conversion: number;
  }): Promise<boolean> {
    const { from, to, conversion } = input;

    const createConversion = await this.conversionRepository.upsertConversion({
      from,
      to,
      conversion,
    });

    console.log(createConversion);

    const reverseConversion = await this.conversionRepository.upsertConversion({
      from: to,
      to: from,
      conversion: 1 / conversion,
    });

    console.log(reverseConversion);

    return true;
  }

  private graphSearch(conversions: Conversion[]): DirectedGraph {
    const graph = new DirectedGraph();

    conversions.forEach((conversion) => {
      const hasFrom = graph.hasNode(conversion.from);
      if (hasFrom === false) {
        graph.addNode(conversion.from, {
          [conversion.to]: conversion.conversion,
        });
      } else {
        graph.updateNode(conversion.from, (attr) => {
          return {
            ...attr,
            [conversion.to]: conversion.conversion,
          };
        });
      }
      const hasTo = graph.hasNode(conversion.to);
      if (hasTo === false) {
        graph.addNode(conversion.to, {
          [conversion.from]: 1 / conversion.conversion,
        });
      } else {
        graph.updateNode(conversion.to, (attr) => {
          return {
            ...attr,
            [conversion.from]: 1 / conversion.conversion,
          };
        });
      }

      graph.addEdge(conversion.from, conversion.to);
    });

    return graph;
  }

  private getPath(input: {
    graph: DirectedGraph;
    from: string;
    to: string;
  }): ShortestPath {
    const { from, to, graph } = input;
    const hasFrom = graph.hasNode(from);
    const hasTo = graph.hasNode(to);

    if (!hasFrom || !hasTo) {
      return null;
    }

    return bidirectional(graph, from, to);
  }

  async convertInAllCoins(input: {
    from: string;
    value: number;
  }): Promise<ConversionAllResponse> {
    const { from, value } = input;

    await this.checkIfCoinsExists({
      from,
    });

    const allCoins = await this.coinRepository.findAll();

    const coinsForQuery = allCoins.filter((coin) => coin.code !== from);

    const convertionsByCoin = await this.conversionRepository.findAllByFrom(
      from,
    );

    if (convertionsByCoin.length === coinsForQuery.length) {
      const conversions: any = convertionsByCoin.map((conversion) => {
        return {
          from: from,
          to: conversion.to,
          value: value,
          conversion: conversion.conversion * value,
        };
      });

      return {
        conversions,
      };
    }

    const conversions = await this.convertAllCoinsByGraph({
      coinsForQuery,
      from,
      value,
    });

    return {
      conversions,
    };
  }

  private async convertAllCoinsByGraph(input: {
    coinsForQuery: Coin[];
    from: string;
    value: number;
  }) {
    const { coinsForQuery, from, value } = input;
    const allConversions = await this.conversionRepository.findAll();

    const graph = this.graphSearch(allConversions);

    const allPaths: ShortestPath[] = [];

    for (let i = 0; i < coinsForQuery.length; i++) {
      allPaths.push(
        this.getPath({
          from,
          graph,
          to: coinsForQuery[i].code,
        }),
      );
    }

    const conversions: any = await Promise.all(
      allPaths.map(async (path, i) => {
        if (path === null) {
          const result: ConversionResponse = {
            from,
            to: coinsForQuery[i].code,
            value,
            conversion: 'not enough data to convert',
          };

          return result;
        }

        let acumulator: number = value;

        for (let i = 0; i < path.length - 1; i++) {
          const change = allConversions.filter(
            (conversion) =>
              conversion.from === path[i] && conversion.to === path[i + 1],
          )[0];

          acumulator *= change.conversion;
        }

        await this.upsertConversion({
          from,
          to: coinsForQuery[i].code,
          conversion: acumulator / value,
        });

        const result: ConversionResponse = {
          from,
          to: coinsForQuery[i].code,
          value,
          conversion: acumulator,
        };

        return result;
      }),
    );

    return conversions;
  }
}
