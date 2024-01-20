import { Module } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { Currency, CurrencySchema } from 'src/currency.schema';
import { ExchangeRateController } from './exchange-rate.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Currency.name, schema: CurrencySchema },
    ]),
  ],
  providers: [ExchangeRateService],
  controllers: [ExchangeRateController],
})
export class ExchangeRateModule {}
