import { Controller, Get, Post, Param, Req, Body, Delete, BadRequestException} from '@nestjs/common';
import { RegisterStockDto } from './dto/register-stock.dto';
import { SimStockDto } from './dto/simulation-stock.dto';
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
  async listStocks(@Req()req: Request,){
    try {
      const listaAll = await this.stocksService.listStocks(req.user);
      return listaAll;
    } catch (error) {
      throw new BadRequestException('Deu erro');
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

  @Post('/sell')
  async sellStock(
    @Req()req: Request,
    @Body() stockInfo: SellStockDto
  ) {
    const stocSold = await this.stocksService.sellStockInfo(req.user, stockInfo)
    return stocSold;
  }

  @Delete('/delone/:id')
  async deleteStock (
    @Req()req: Request,
    @Param('id') id: string
  ) {
    console.log('Entrou no lugar certo');
    const simDeleted = await this.stocksService.deleteOneStock(req.user, id)
    return simDeleted;
  }

  @Delete('/dellall')
  async deleteAllSims (
    @Req()req: Request
  ) {
    console.log('Entrou no lugar errado');
    const simDeleted = await this.stocksService.deleteAllStocks(req.user)
    return simDeleted;
  }

  @Delete('/all')
  async clearUserStocks(@Req()req: Request){
    const clearUser = await this.stocksService.clearUserStocks(req.user);
    return clearUser;
  }
}