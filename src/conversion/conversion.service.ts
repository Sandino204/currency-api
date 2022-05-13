/*
https://docs.nestjs.com/providers#services
*/

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
import { ShortestPath, ShortestPathMapping } from 'graphology-shortest-path/unweighted';

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

  async convert(input: ConversionDto): Promise<any> {
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
        converted: existsWhitDepthZero.conversion * value,
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
    to: string;
  }): Promise<boolean> {
    const { from, to } = input;
    const toCoin = await this.coinRepository.findByCode(from);
    const fromCoin = await this.coinRepository.findByCode(to);

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
}
