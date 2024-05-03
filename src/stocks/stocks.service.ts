import { findStockBr, findInflation } from './utilities/api-find';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RegisterStockDto } from './dto/register-stock.dto';
import { SimStockDto } from './dto/simulation-stock.dto';
import { SellStockDto } from './dto/sell-stock.dto';
import { IUser } from 'src/interfaces/IUser';

@Injectable()
export class StocksService {
  constructor(private readonly databaseService: DatabaseService) {}

  //Busca uma ação na API
  async findOne(symbol: string) {
    const response = await findStockBr(symbol);
    if(!response){
      throw new BadRequestException('Erro ao obter cotação');
    }
    const { regularMarketPrice } = response.data.results[0];
    const { longName } = response.data.results[0];
    const stockInfo = {Symbol: symbol, LongName: longName, Price: regularMarketPrice};
    return stockInfo;
  }

  async serviceToFindInflation(value: number) {
    const date1 = new Date('2020-01-01');
    const date2 = new Date('2023-01-01');
    console.log( 'date 1: ' + date1 + '\nHora de entrar no findInflation' );
    const inflation = await findInflation(date1, date2);
    console.log(inflation);
    return value;
  }

  async findOneStock(symbol: string, user: IUser) { 
    const stocks = await this.databaseService.stock.findMany({ where: {
      symbol: symbol,
      ownerId: user.id
    }});
    return stocks;
  }

  //lista todas as simulações de ação do usuário
  async listStocks( user: IUser ) {
    const stocks = await this.databaseService.stock.findMany({ where: { ownerId: user.id } });
    if(!stocks){
      throw new BadRequestException('Não foi encontrada nenhuma simulação de ação sendo feita');
    }
    return stocks;
  }

  //Faz um registro de ação
  async registerStock(registerStockDto: RegisterStockDto, user: IUser){
    try {
      if(!user.id){
        throw new BadRequestException('Usuário não está logado');
      }      
      const newStock = await this.databaseService.stock.create({
        data: {
          ownerId: user.id,
          symbol: registerStockDto.symbol,
          qnt: registerStockDto.qnt,
          price: registerStockDto.price,
          longName: registerStockDto.longName,
          //date: registerStockDto.date,
          simulation: true
        }
      });
      return newStock;
    } catch (error) {
      throw new BadRequestException('Não foi possivel fazer o registro de compra');
    }
  }

  async simStock(simStockDto: SimStockDto, user: IUser){
    try {      
      if(!user.id){
        throw new BadRequestException('Usuário não está logado');
      }

      const newStock = await this.databaseService.stock.create({
        data: {
          symbol: simStockDto.symbol,
          longName: simStockDto.longName,
          price: simStockDto.price,
          qnt: simStockDto.qnt,
          ownerId: user.id,
          simulation: true  
        }
      });
      return newStock;
    } catch (error) {
      throw new BadRequestException('Não foi possivel fazer a simulação de compra');
    }
  }

  //Simula a venda da ação
  //Deve ser possivel fazer a simulação de venda ou o registro da venda
  /*
  Compra corrigida - C
  Venda - V
  Proventos - P
  Imposto - I = (V + P - C) * 0,15
  Lucro Final - LF = V + P - C - I

  @Body:
  compra: number
  venda: number
  proventos: number
  */
  async sellStockInfo(user:IUser, stockInfo:SellStockDto){
    if(!user.id){
      throw new BadRequestException('Usuário não está logado');
    }

    //Pegando as infos da ação pelo DB
    const stockSoldInfo = await this.databaseService.stock.findUnique({ where: {
      id: stockInfo.id, //puxado do site
      ownerId: user.id
    }});    
    if(!stockSoldInfo){
      throw new BadRequestException('Não foi encontrada a ação');
    }
    
    const buyPriceRaw = stockSoldInfo.price * stockSoldInfo.qnt;
    //metodo para corrigir o valor (compra)  EXEMPLO -----------------------------------------
    const buyPriceCorrected = buyPriceRaw * 1.15;
    //----------------------------------------------------------------------------------------
    
    //Obtendo o valor de venda
      //Via simulação
    let sellPrice: number;
    let singleSellPrice: number
    if(stockSoldInfo.simulation){ //da API
      const response = await findStockBr(stockSoldInfo.symbol);  
      singleSellPrice = (response.data.results[0].regularMarketPrice);
      sellPrice = singleSellPrice * stockSoldInfo.qnt;
    } else {//do body
      sellPrice = stockInfo.sellPrice;
    }
    
    //const profit = (sellPrice + stockInfo.provents - buyPriceCorrected);
    const taxes = (sellPrice - buyPriceCorrected) * 0.15;
    const profit = (sellPrice - buyPriceCorrected - taxes);

    //É preciso completar esses dados
    const result = {
      stockName: stockSoldInfo.longName,
      stockSymbol: stockSoldInfo.symbol,
      paidPriceSingle: stockSoldInfo.price,
      paidPrice: buyPriceCorrected,
      sellPriceSingle: singleSellPrice,
      sellPrice: sellPrice,
      taxes: (taxes),
      profit: profit,
      proportionalProfit: `${((profit / buyPriceCorrected) * 100).toFixed(2)}%`
    };
    
    return result;
  }

  async deleteOneStock(user:IUser, id: string){
    if(!user.id){
      throw new BadRequestException('Usuário não está logado');
    }
    const product = await this.databaseService.stock.findUnique({ where: { id:parseInt(id)} });
    console.log(product);
    if(product){
      await this.databaseService.stock.delete({ where: {id:parseInt(id)} });   
    } else{
      return 'Não deu bom não';
    }
    return 'A simulção foi deletada';
  }

  //Deleta uma simulação
  async deleteAllStocks(user:IUser){
    if(!user.id){
      throw new BadRequestException('Usuário não está logado');
    }
    await this.databaseService.stock.deleteMany({ where: {
      ownerId: user.id
    }});
    return 'A simulção foi deletada'
  }

  

  //Deleta todas as simulações
  async clearUserStocks(user: IUser){
    if(!user.id){
      throw new BadRequestException('Usuário não está logado');
    }
    try {      
      await this.databaseService.stock.deleteMany({});
      return 'As simulações desse usuário foram deletadas'
    } catch (error) {
      throw new BadRequestException('Não foi possivel deletar as simulações desse usuário');      
    }
  }
}
