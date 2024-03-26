import { Controller, Get, Post, Param, Req, Body} from '@nestjs/common';
import { StocksService } from './stocks.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { Request } from 'express';
   
@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}
   
  @Get(':symbol')
  async findOne(@Param('symbol') symbol: string) {
    const stockInfo = await this.stocksService.findOne(symbol);
    return stockInfo;    
  }

  /*
  @Body (createStockDto)
  symbol: STRING
  qnt:    INT
  */
  @Post(':symbol')
  async buyStock(
    @Body() createStockDto: CreateStockDto,
    @Param('symbol') symbol: string,
    @Req()req: Request
  ) {
    const stockBought = await this.stocksService.buyStock(createStockDto, symbol, req.user);
    return stockBought;
  }
}