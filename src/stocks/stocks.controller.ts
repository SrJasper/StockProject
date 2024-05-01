import { Controller, Get, Post, Param, Req, Body, Delete, BadRequestException} from '@nestjs/common';
import { RegisterStockDto } from './dto/register-stock.dto';
import { SimStockDto } from './dto/simulation-stock.dto';
import { SelectStockDto } from './dto/select-stock.dto';
import { SellStockDto } from './dto/sell-stock.dto';
import { StocksService } from './stocks.service';
import { Request } from 'express';
   
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}
   
  @Get('/search/:symbol')
  async findOne(@Param('symbol') symbol: string) {
    const stockInfo = await this.stocksService.findOne(symbol);
    return stockInfo;    
  }

  @Get('/search/inf/:value')
  async findInf(@Param('value') value: number){
    const inflationInfo = await this.stocksService.serviceToFindInflation(value);
    return inflationInfo;
  }

  @Get('list/:symbol')
  async findOneStock(
    @Param('symbol') symbol: string, 
    @Req()req: Request){
    const listBySymbol = await this.stocksService.findOneStock(symbol, req.user);
    return listBySymbol;
  }

  @Get('listall')
  async listStocks(@Req()req: Request){
    try {
      const listaAll = await this.stocksService.listStocks(req.user);
      return listaAll;
    } catch (error) {
      throw new BadRequestException('Deu um erro escroto');
    }    
  }

  @Post('/regsim')
  async registerStock(
    @Body() registerStockDto: RegisterStockDto,
    @Req()req: Request
  ) {
    const stockRegister = await this.stocksService.registerStock(registerStockDto, req.user);
    return stockRegister;
  }

  @Post('/newsim')
  async simStock(
    @Body() simStockDto: SimStockDto,
    @Req()req: Request
  ) {
    const stockBought = await this.stocksService.simStock(simStockDto, req.user);
    return stockBought;
  }

  // @Post(':symbol')
  // async simStock(
  //   @Body() simStockDto: SimStockDto,
  //   @Param('symbol') symbol: string,
  //   @Req()req: Request
  // ) {
  //   console.log('Entrou na rota 2');
  //   const stockBought = await this.stocksService.simStock(simStockDto, symbol, req.user);
  //   return stockBought;
  // }

  @Delete('/sell')
  async sellStock(
    @Req()req: Request,
    @Body() stockInfo: SellStockDto
  ) {
    console.log('Entrou em sell');
    const stocSold = await this.stocksService.sellStock(req.user, stockInfo)
    return stocSold;
  }

  @Delete('/del')
  async deleteSim (
    @Req()req: Request,
    @Body() id: SelectStockDto
  ) {
    console.log('Entrou na rota del');
    const simDeleted = await this.stocksService.deleteStock(req.user, id)
    return simDeleted;
  }

  @Delete('/all')
  async clearUserStocks(@Req()req: Request){
    console.log('Entrou na rota delete all');
    const clearUser = await this.stocksService.clearUserStocks(req.user);
    return clearUser;
  }
}