import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  Body,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { RegisterStockDto } from './dto/register-stock.dto';
import { SimStockDto } from './dto/simulation-stock.dto';
import { SellStockDto } from './dto/sell-stock.dto';
import { StocksService } from './stocks.service';
import { Request } from 'express';
import { DellStockDto } from './dto/dell-stock.dto';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get('/search/:symbol')
  async findOne(@Param('symbol') symbol: string) {
    try {
      const stockInfo = await this.stocksService.searchStock(symbol);
      return stockInfo;
    } catch (error) {
      return 'not found';
    }
  }

  @Get('/inf')
  async findInf() {
    const inflationInfo = await this.stocksService.serviceToFindInflation();
    return inflationInfo;
  }

  @Get('list/:symbol')
  async findOneStock(@Param('symbol') symbol: string, @Req() req: Request) {
    const listBySymbol = await this.stocksService.findOneStock(
      symbol,
      req.user,
    );
    return listBySymbol;
  }

  @Get('listall')
  async listStocks(@Req() req: Request) {
    try {
      const listaAll = await this.stocksService.listStocks(req.user);
      return listaAll;
    } catch (error) {
      throw error;
    }
  }

  @Get('statement/:symbol')
  async listStatement(@Req() req: Request, @Param('symbol') symbol: string) {
    console.log('entrou na rota de statement');
    try {
      const listaAll = await this.stocksService.listStatement(req.user, symbol);
      return listaAll;
    } catch (error) {
      throw error;
    }
  }

  @Post('/regsim')
  async registerStock(
    @Body() registerStockDto: RegisterStockDto,
    @Req() req: Request,
  ) {
    const stockRegister = await this.stocksService.registerStock(
      registerStockDto,
      req.user,
    );
    return stockRegister;
  }

  @Post('/newsim')
  async simStock(@Body() simStockDto: SimStockDto, @Req() req: Request) {
    const stockBought = await this.stocksService.simStock(
      simStockDto,
      req.user,
    );
    return stockBought;
  }

  @Post('/sellinfo')
  async sellStockInfo(@Req() req: Request, @Body() stockInfo: SellStockDto) {
    const stocSold = await this.stocksService.sellStockInfo(
      req.user,
      stockInfo,
    );
    return stocSold;
  }

  @Post('/sell')
  async sellStock(@Req() req: Request, @Body() stockInfo: SellStockDto) {
    const stocSold = await this.stocksService.sellStockController(
      req.user,
      stockInfo,
    );
    return stocSold;
  }

  @Delete('/del')
  async delStock(@Body() stockInfo: DellStockDto) {
    const stockDeleted = await this.stocksService.deleteStock(stockInfo);
    return stockDeleted;
  }

  @Delete('/dellall')
  async deleteAllSims(@Req() req: Request) {
    const simDeleted = await this.stocksService.deleteAllStocks(req.user);
    return simDeleted;
  }

  @Delete('/all')
  async clearUserStocks(@Req() req: Request) {
    const clearUser = await this.stocksService.clearUserStocks(req.user);
    return clearUser;
  }
}
