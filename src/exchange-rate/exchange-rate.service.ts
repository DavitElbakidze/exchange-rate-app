import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { Currency } from 'src/currency.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

@Injectable()
export class ExchangeRateService implements OnModuleInit {
  private readonly logger = new Logger(ExchangeRateService.name);
  constructor(
    @InjectModel(Currency.name)
    private readonly currencyModel: Model<Document>,
  ) {}

  async onModuleInit() {
    await this.fetchAndStoreRates();
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async fetchAndStoreRates() {
    try {
      const response = await axios.get(
        'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json/',
      );
      const exchangeRates = response.data[0].currencies;

      await Promise.all(
        exchangeRates.map(async (rate) => {
          const currencyData: Partial<Currency> = {
            currencyCode: rate.code,
            currencyName: rate.name,
            rate: rate.rate,
            date: new Date(rate.date),
          };
          await this.currencyModel.create(currencyData);
        }),
      );
    } catch (error) {
      this.logger.error(`Error in fetchAndStoreRates: ${error.message}`);
    }
  }
}
