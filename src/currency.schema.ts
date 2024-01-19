import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Currency extends Document {
  @Prop({ required: true, unique: true })
  currencyCode: string;

  @Prop({ required: true })
  currencyName: string;

  @Prop({ required: true })
  rate: number;

  @Prop({ required: true })
  date: Date;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
