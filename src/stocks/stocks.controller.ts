import { Controller, Get, Post, Param, Req, Body, Delete, BadRequestException} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { Request } from 'express';
import { SelectStockDto } from './dto/select-stock.dto';
import { SellStockDto } from './dto/sell-stock.dto';
   
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}
   
  @Get('/search/:symbol')
  async findOne(@Param('symbol') symbol: string) {
    const stockInfo = await this.stocksService.findOne(symbol);
    return stockInfo;    
  }

  @Post(':symbol')
  async buyStock(
    @Body() createStockDto: CreateStockDto,
    @Param('symbol') symbol: string,
    @Req()req: Request
  ) {
    const stockBought = await this.stocksService.buyStock(createStockDto, symbol, req.user);
    return stockBought;
  }

  @Delete()
  async sellStock(
    @Req()req: Request,
    @Body() stockInfo: SellStockDto
  ) {
    const stocSold = await this.stocksService.sellStock(req.user, stockInfo)
    return stocSold;
  }

  @Delete('del')
  async deleteSim (
    @Req()req: Request,
    @Body() id: SelectStockDto
  ) {
    const simDeleted = await this.stocksService.deleteSimStock(req.user, id)
    return simDeleted;
  }

  @Delete('all')
  async clearUserStocks(@Req()req: Request){
    const clearUser = await this.stocksService.clearUserStocks(req.user);
    return clearUser;
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

  @Get('list/:symbol')
  async findOneStock(
    @Param('symbol') symbol: string, 
    @Req()req: Request){
    const listBySymbol = await this.stocksService.findOneStock(symbol, req.user);
    return listBySymbol;
  }

  /*
  @Get('test')
  async testPython(){
    const testResult = await this.stocksService.testPython();
    return testResult;
  }
  */
}