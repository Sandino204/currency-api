import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CoinDocument = Coin & Document;

@Schema()
export class Coin {
  @Prop({ unique: true })
  name: string;

  @Prop({ unique: true })
  symbol: string;

  @Prop({ unique: true })
  code: string;
}

export const CoinSchema = SchemaFactory.createForClass(Coin);
