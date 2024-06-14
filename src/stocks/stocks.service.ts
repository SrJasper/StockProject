import { findStockBr, findInflation } from './utilities/api-find';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RegisterStockDto } from './dto/register-stock.dto';
import { SimStockDto } from './dto/simulation-stock.dto';
import { SellStockDto } from './dto/sell-stock.dto';
import { IUser } from 'src/interfaces/IUser';
import { response } from 'express';

@Injectable()
export class StocksService {
  constructor(private readonly databaseService: DatabaseService) {}

  //Busca uma ação na API
  async searchStock(symbol: string) {
    const response = await findStockBr(symbol);
    if (!response) {
      throw new BadRequestException('Símbolo não encontrado');
    }
    if (response.data.results[0].currency === null) {
      throw new BadRequestException('Símbolo não encontrado');
    }
    const { regularMarketPrice } = response.data.results[0];
    const { longName } = response.data.results[0];
    const { currency } = response.data.results[0];
    const stockInfo = {
      Symbol: symbol,
      LongName: longName,
      Price: regularMarketPrice,
      Currency: currency,
    };
    return stockInfo;
  }

  async findOneStock(symbol: string, user: IUser) {
    const stocks = await this.databaseService.stock.findMany({
      where: {
        symbol: symbol,
        ownerId: user.id,
      },
    });
    return stocks;
  }

  //lista todas as simulações de ação do usuário
  async listStocks(user: IUser) {
    const stocks = await this.databaseService.stock.findMany({
      where: { ownerId: user.id },
    });
    if (stocks.length === 0) {
      return null;
    }
    return stocks;
  }

  //Faz um registro de ação
  async registerStock(registerStockDto: RegisterStockDto, user: IUser) {
    try {
      if (!user.id) {
        throw new BadRequestException('Usuário não está logado');
      }
      const opDate: Date = new Date(
        registerStockDto.operationDate + 'T01:01:01.001Z',
      );
      const newStock = await this.databaseService.stock.create({
        data: {
          ownerId: user.id,
          symbol: registerStockDto.symbol,
          qnt: registerStockDto.qnt,
          price: registerStockDto.price,
          longName: registerStockDto.longName,
          operationDate: opDate,
          simulation: false,
        },
      });

      return newStock;
    } catch (error) {
      throw new BadRequestException(
        'Não foi possivel fazer o registro de compra',
      );
    }
  }

  async simStock(simStockDto: SimStockDto, user: IUser) {
    try {
      if (!user.id) {
        throw new BadRequestException('Usuário não está logado');
      }

      const newStock = await this.databaseService.stock.create({
        data: {
          symbol: simStockDto.symbol,
          longName: simStockDto.longName,
          price: simStockDto.price,
          qnt: simStockDto.qnt,
          ownerId: user.id,
          simulation: true,
        },
      });
      return newStock;
    } catch (error) {
      throw new BadRequestException(
        'Não foi possivel fazer a simulação de compra',
      );
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
  async serviceToFindInflation() {
    // const date1 = new Date('2019-05-15');
    // const date2 = new Date('2022-08-15');
    // const value = 100;
    // console.log("value: " + value);
    // const inflation = await findInflation(date1, date2, value);
    // return inflation;
  }

  async sellStockInfo(user: IUser, stockBodyInfo: SellStockDto) {
    
    if (!user.id) {
      throw new BadRequestException('Usuário não está logado');
    }
    if (stockBodyInfo.provents === undefined) {
      stockBodyInfo.provents = 0;
    }

    //Pegando as infos da ação pelo DB
    const stockSoldInfo = await this.databaseService.stock.findUnique({
      where: {
        id: stockBodyInfo.id, //puxado do site
        ownerId: user.id,
      },      
    });
    
    console.log('quantidade enviada pelo Front: ', stockBodyInfo.qnt);
    if(stockBodyInfo.qnt === undefined){
      stockBodyInfo.qnt = stockSoldInfo.qnt;      
      console.log('vender tudo: ', stockBodyInfo.qnt);
    } else {
      console.log('qunatidade a ser operada: ', stockBodyInfo.qnt);
    }
    if (!stockSoldInfo) {
      throw new BadRequestException('Não foi encontrada a ação');
    }

    
    const buyPriceRaw = stockSoldInfo.price * stockBodyInfo.qnt;
    
    
    //Obtendo valor da ação na venda
    let sellPrice: number;
    let singleSellPrice: number;
    let buyPriceCorrected: number;
    
    if (stockSoldInfo.simulation) {      
      //via API
      console.log('symbol: ', stockSoldInfo.symbol);
      const response = await findStockBr(stockSoldInfo.symbol);
      console.log(
        'valor da stock: ',
        response.data.results[0].regularMarketPrice,
      );
      if (!response.data.results[0].regularMarketPrice) {
        sellPrice = 0;
      } else {
        singleSellPrice = response.data.results[0].regularMarketPrice;
        sellPrice = singleSellPrice * stockBodyInfo.qnt;
      }
      const currentDate = new Date();
      const newDateSim = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        currentDate.getDate(),
      );
      buyPriceCorrected = await findInflation(
        stockSoldInfo.operationDate,
        newDateSim,
        buyPriceRaw,
      );
    } else {
      //via body
      //console.log('operation date do body: ' + stockSoldInfo.operationDate);
      sellPrice = stockBodyInfo.sellPrice * stockBodyInfo.qnt;
      let newDateReg: Date;
      if (stockBodyInfo.date === undefined) {
        const currentDate = new Date();
        newDateReg = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          currentDate.getDate(),
        );
      } else {
        newDateReg = new Date(stockBodyInfo.date);
      }
      buyPriceCorrected = await findInflation(
        stockSoldInfo.operationDate,
        newDateReg,
        buyPriceRaw,
      );
      //console.log('opration.date a ser passada para a request: ' + dateRegBuy);
    }

    //const profit = (sellPrice + stockInfo.provents - buyPriceCorrected);
    let taxes: number;
    if (sellPrice > 20000) {
      taxes = (sellPrice - buyPriceCorrected) * 0.15;
    } else {
      taxes = 0;
    }

    const profit = sellPrice - buyPriceCorrected - taxes + stockBodyInfo.provents;
    
    const result = {
      stockName: stockSoldInfo.longName,
      stockSymbol: stockSoldInfo.symbol,
      paidPriceSingle: stockSoldInfo.price,
      paidPrice: buyPriceCorrected,
      sellPriceSingle: singleSellPrice,
      sellPrice: sellPrice,
      taxes: taxes,
      profit: profit,
      proportionalProfit: `${((profit / buyPriceCorrected) * 100).toFixed(2)}%`,
    };

    console.log('result: ', result)

    return result;
  }

  async sellStockController(user: IUser, stockBodyInfo: SellStockDto) {
    if (!user.id) {
      throw new BadRequestException('Usuário não está logado');
    }    
    const response = await this.databaseService.stock.findUnique({
      where: {
        id: stockBodyInfo.id, //puxado do site
        ownerId: user.id,
      },
    });

    if(stockBodyInfo.qnt === undefined){
      console.log("Não tem qnt");
      stockBodyInfo.qnt = response.qnt;
    } else{ 
      console.log("Tem qnt");
    }

    if (stockBodyInfo.qnt >= response.qnt) {
      return this.sellAllStock(user, stockBodyInfo.id.toString());
    } else {
      return this.sellSomeStock(user, stockBodyInfo.id.toString(), stockBodyInfo.qnt);  
    }
  }

  async sellAllStock(user: IUser, id: string) {
    if (!user.id) {
      throw new BadRequestException('Usuário não está logado');
    }
    const product = await this.databaseService.stock.findUnique({
      where: { id: parseInt(id) },
    });
    if (product) {
      await this.databaseService.stock.delete({ where: { id: parseInt(id) } });
    } else {
      return 'Não deu bom não';
    }
    return 'A simulção foi deletada';
  }

  async sellSomeStock(user: IUser, id: string, qnt: number) {
    if (!user.id) {
      throw new BadRequestException('Usuário não está logado');
    }
    const product = await this.databaseService.stock.findUnique({ where: { id: parseInt(id) } });
    if (product) {
      await this.databaseService.stock.update({ 
        where: { id: parseInt(id) },
        data: {
          qnt: product.qnt - qnt,
        },
      });
    } else {
      return 'Não foi possivel encontrar a operação';	
    }
    return 'Foram vendidas ' + qnt + ' ações';
  }

  //Deleta uma simulação
  async deleteAllStocks(user: IUser) {
    if (!user.id) {
      throw new BadRequestException('Usuário não está logado');
    }
    await this.databaseService.stock.deleteMany({
      where: {
        ownerId: user.id,
      },
    });
    return 'A simulção foi deletada';
  }

  //Deleta todas as simulações
  async clearUserStocks(user: IUser) {
    if (!user.id) {
      throw new BadRequestException('Usuário não está logado');
    }
    try {
      await this.databaseService.stock.deleteMany({});
      return 'As simulações desse usuário foram deletadas';
    } catch (error) {
      throw new BadRequestException(
        'Não foi possivel deletar as simulações desse usuário',
      );
    }
  }
}
