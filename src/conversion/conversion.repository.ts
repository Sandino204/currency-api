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
      console.log(err);

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

      return conversions;
    } catch (err) {
      console.log(err);

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
      console.log(err);

      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }
  }

  async findAll(): Promise<Conversion[]> {
    try {
      const conversions = this.conversionModel.find().lean();

      return conversions;
    } catch (err) {
      console.log(err);

      throw new InternalServerErrorException({
        message: 'Something went wrong',
      });
    }
  }
}
