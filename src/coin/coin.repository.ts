import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coin, CoinDocument } from './coin.entity';
import { CreateCoinDto } from './dto/create-coin.dto';
import { UpdateCoinDto } from './dto/update-coin.dto';

@Injectable()
export class CoinRepository {
  constructor(
    @InjectModel(Coin.name) private readonly coinModel: Model<CoinDocument>,
  ) {}

  async findAll(): Promise<Coin[]> {
    try {
      const coins = await this.coinModel.find().lean();

      return coins;
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }
  }

  async findByID(id: string): Promise<Coin> {
    try {
      const coin = await this.coinModel.findById(id).lean();

      return coin;
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }
  }

  async findByCode(code: string): Promise<Coin> {
    try {
      const coin = await this.coinModel.findOne({ code }).lean();

      return coin;
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }
  }

  async create(input: CreateCoinDto): Promise<Coin> {
    try {
      const newCoin = await this.coinModel.create(input);

      return newCoin;
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }
  }

  async update(input: UpdateCoinDto): Promise<void> {
    try {
      await this.coinModel.updateOne(
        {
          code: input.code,
        },
        {
          name: input.name,
          symbol: input.symbol,
        },
      );
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }
  }

  async delete(code: string): Promise<void> {
    try {
      await this.coinModel.deleteOne({
        code,
      });
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }
  }
}
