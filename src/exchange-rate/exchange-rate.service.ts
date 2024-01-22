import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { Currency, CurrencyDocument } from 'src/currency.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ExchangeRateService implements OnModuleInit {
  private readonly logger = new Logger(ExchangeRateService.name);
  constructor(
    @InjectModel(Currency.name)
    private readonly currencyModel: Model<CurrencyDocument>,
  ) {}

  async onModuleInit() {
    await this.fetchAndStoreRates();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
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

  async getExchangeRateByCurrencyAndDate(
    currencyCode: string,
    date: string,
  ): Promise<Currency | { statusCode: number; message: string }> {
    try {
      const formattedDate = new Date(date);
      formattedDate.setUTCHours(0, 0, 0, 0);

      const exchangeRate = await this.currencyModel.findOne({
        currencyCode,
        date: {
          $gte: formattedDate.toISOString(),
          $lt: new Date(
            formattedDate.getTime() + 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      });
      if (!exchangeRate) {
        return {
          statusCode: 404,
          message: `No exchange rate found for ${currencyCode} on ${date}`,
        };
      }
      return exchangeRate;
    } catch (error) {
      this.logger.error(
        `Error in getExchangeRateByCurrencyAndDate: ${error.message}`,
      );
      return {
        statusCode: 500,
        message: `Error in getExchangeRateByCurrencyAndDate: ${error.message}`,
      };
    }
  }

  async getRateByCode(
    currencyCode: string,
  ): Promise<Currency | { statusCode: number; message: string }> {
    try {
      const exchangeRate = await this.currencyModel
        .findOne({ currencyCode })
        .sort({ date: -1 });
      if (!exchangeRate) {
        return {
          statusCode: 404,
          message: `No exchange rate found for ${currencyCode}`,
        };
      }
      return exchangeRate;
    } catch (error) {
      this.logger.error(`Error in getRateByCode: ${error.message}`);
      return {
        statusCode: 500,
        message: `Error in getRateByCode: ${error.message}`,
      };
    }
  }

  async getAllExchangeRateByDate(
    date?: Date,
  ): Promise<Currency[] | { statusCode: number; message: string }> {
    try {
      const formattedDate = new Date(date);
      formattedDate.setUTCHours(0, 0, 0, 0);
      const exchangeRates = await this.currencyModel.find({
        date: {
          $gte: formattedDate.toISOString(),
          $lt: new Date(
            formattedDate.getTime() + 24 * 60 * 60 * 1000,
          ).toISOString(),
        },
      });
      if (!exchangeRates) {
        return {
          statusCode: 404,
          message: `No exchange rates found for ${date}`,
        };
      }

      return exchangeRates;
    } catch (error) {
      this.logger.error(`Error in getAllExchangeRateByDate: ${error.message}`);
      return {
        statusCode: 500,
        message: `Error in getAllExchangeRateByDate: ${error.message}`,
      };
    }
  }
}
