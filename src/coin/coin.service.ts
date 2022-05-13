/*
https://docs.nestjs.com/providers#services
*/

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CoinRepository } from './coin.repository';
import { Coin } from './coin.entity';
import { CreateCoinDto } from './dto/create-coin.dto';
import { UpdateCoinDto } from './dto/update-coin.dto';

@Injectable()
export class CoinService {
  constructor(private readonly coinRepository: CoinRepository) {}

  async getAllCoins(): Promise<Coin[]> {
    const coins = await this.coinRepository.findAll();

    if (!coins) {
      throw new NotFoundException({
        message: 'Coins not found',
      });
    }

    return coins;
  }

  async getCoinById(id: string): Promise<Coin> {
    const coin = await this.coinRepository.findByID(id);

    if (!coin) {
      throw new NotFoundException({
        message: 'Coins not found',
      });
    }

    return coin;
  }

  async getCoinByCode(code: string): Promise<Coin> {
    const coin = await this.coinRepository.findByCode(code);

    if (!coin) {
      throw new NotFoundException({
        message: 'Coins not found',
      });
    }

    return coin;
  }

  async createCoin(input: CreateCoinDto): Promise<Coin> {
    const existCoin = await this.coinRepository.findByCode(input.code);

    console.log(existCoin);

    if (existCoin !== null) {
      throw new ConflictException({
        message: 'Coin with code already exists',
      });
    }

    const newCoin = await this.coinRepository.create(input);

    return newCoin;
  }

  async updateCoin(input: UpdateCoinDto): Promise<void> {
    const coin = await this.getCoinByCode(input.code);

    const updateCoin: UpdateCoinDto = {
      code: input.code,
      name: typeof input.name !== 'undefined' ? input.name : coin.name,
      symbol: typeof input.symbol !== 'undefined' ? input.symbol : coin.symbol,
    };

    await this.coinRepository.update(updateCoin);
  }

  async deleteCoin(code: string): Promise<void> {
    await this.getCoinByCode(code);

    await this.coinRepository.delete(code);
  }
}
