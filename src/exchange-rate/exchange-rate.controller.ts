import { Controller, Get, Param } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { Currency } from 'src/currency.schema';

@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get('by-code/:currencyCode')
  async getExchangeRateByCode(
    @Param('currencyCode') currencyCode: string,
  ): Promise<Currency | { statusCode: number; message: string }> {
    try {
      const exchangeRate = await this.exchangeRateService.getRateByCode(
        currencyCode,
      );

      if (!exchangeRate) {
        return {
          statusCode: 404,
          message: `No exchange rate found for ${currencyCode}`,
        };
      }
      return exchangeRate as Currency;
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Something Went Wrong!',
      };
    }
  }

  @Get('by-date/:currencyCode/:date')
  async getExchangeRateByDate(
    @Param('currencyCode') currencyCode: string,
    @Param('date') date: string,
  ): Promise<Currency | { statusCode: number; message: string }> {
    try {
      const exchangeRate =
        await this.exchangeRateService.getExchangeRateByCurrencyAndDate(
          currencyCode,
          date,
        );

      if (!exchangeRate) {
        return {
          statusCode: 404,
          message: `No exchange rate found for ${currencyCode} on ${date}`,
        };
      }
      return exchangeRate as Currency;
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Something Went Wrong!',
      };
    }
  }

  @Get('exchange-rates/by-date/:date')
  async getAllExchangeRateByDate(
    @Param('date') date: string,
  ): Promise<Currency[] | { statusCode: number; message: string }> {
    try {
      const exchangeRates =
        await this.exchangeRateService.getAllExchangeRateByDate(new Date(date));

      if (!exchangeRates) {
        return {
          statusCode: 404,
          message: `No exchange rates found on ${date}`,
        };
      }
      return exchangeRates as Currency[];
    } catch (error) {
      return {
        statusCode: 500,
        message: 'Something Went Wrong!',
      };
    }
  }
}
