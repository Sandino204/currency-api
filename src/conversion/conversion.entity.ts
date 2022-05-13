import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConversionDocument = Conversion & Document;

@Schema()
export class Conversion {
  @Prop()
  from: string;

  @Prop()
  to: string;

  @Prop()
  conversion: number;
}

export const ConversionSchema = SchemaFactory.createForClass(Conversion);
