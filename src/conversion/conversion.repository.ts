import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversion, ConversionDocument } from './conversion.entity';

@Injectable()
export class ConversionRepository {
  constructor(
    @InjectModel(Conversion.name)
    private readonly conversionModel: Model<ConversionDocument>,
  ) {}

  async findAll(): Promise<Conversion[]> {
    try {
      const conversions = this.conversionModel.find().lean();

      return await conversions;
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }
  }

  async findExactConversion(input: {
    from: string;
    to: string;
  }): Promise<Conversion | null> {
    try {
      const { from, to } = input;
      const conversion = await this.conversionModel
        .findOne({
          from,
          to,
        })
        .lean();

      return conversion;
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }
  }

  async findAllByFrom(from: string): Promise<Conversion[]> {
    try {
      const conversions = this.conversionModel
        .find({
          from,
        })
        .lean();

      return await conversions;
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }
  }

  async upsertConversion(input: {
    from: string;
    to: string;
    conversion: number;
  }): Promise<Conversion> {
    try {
      const { from, to, conversion } = input;

      const updated = await this.conversionModel.findOneAndUpdate(
        {
          from,
          to,
        },
        {
          conversion,
        },
        {
          new: true,
          upsert: true,
        },
      );

      return updated;
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }
  }

  async deleteAllConversionsByCoin(coin: string): Promise<void> {
    try {
      await this.conversionModel.deleteMany({
        from: coin,
      });

      await this.conversionModel.deleteMany({
        to: coin,
      });
    } catch (err) {
      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }
  }
}
