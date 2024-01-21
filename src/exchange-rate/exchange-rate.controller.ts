import { Controller, Get, Param } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';

@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get('by-code/:currencyCode')
  async getExchangeRateByCode(@Param('currencyCode') currencyCode: string) {
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
      return exchangeRate;
    } catch (error) {
      return {
        statusCode: 500,
        error: 'Something Went Wrong!',
      };
    }
  }

  @Get('by-date/:currencyCode/:date')
  async getExchangeRateByDate(
    @Param('currencyCode') currencyCode: string,
    @Param('date') date: string,
  ) {
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
      return exchangeRate;
    } catch (error) {
      return {
        statusCode: 500,
        error: 'Something Went Wrong!',
      };
    }
  }

  @Get('exchange-rates/by-date/:date')
  async getAllExchangeRateByDate(@Param('date') date: string) {
    try {
      const exchangeRates =
        await this.exchangeRateService.getAllExchangeRateByDate(new Date(date));

      if (!exchangeRates) {
        return {
          statusCode: 404,
          message: `No exchange rates found on ${date}`,
        };
      }
      return exchangeRates;
    } catch (error) {
      return {
        statusCode: 500,
        error: 'Something Went Wrong!',
      };
    }
  }
}
