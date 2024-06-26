import { findStockBr, findInflation } from './utilities/api-find';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RegisterStockDto } from './dto/register-stock.dto';
import { SimStockDto } from './dto/simulation-stock.dto';
import { SellStockDto } from './dto/sell-stock.dto';
import { IUser } from 'src/interfaces/IUser';
import { Stock } from '@prisma/client';
import { DellStockDto } from './dto/dell-stock.dto';

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
      where: {
        ownerId: user.id,
        OR: [{ type: 'media' }, { simulation: true }],
      },
    });
    if (stocks.length === 0) {
      return null;
    }
    return stocks;
  }

  async listStatement(user: IUser, symbol: string) {
    const stocks = await this.databaseService.stock.findMany({
      where: {
        ownerId: user.id,
        symbol: symbol,
        type: {
          in: ['buy', 'sell'],
        },
        simulation: false,
      },
    });
    if (stocks.length === 0) {
      return null;
    }
    return stocks;
  }

  async findMediaStock(user: IUser, symbol: any, simulation: boolean) {
    symbol = symbol.toUpperCase();
    const stockList = await this.databaseService.stock.findMany({
      where: {
        symbol: symbol,
        ownerId: user.id,
        simulation: simulation,
      },
    });
    const stockMedia = stockList.find((stock) => stock.type === 'media');
    return stockMedia;
  }

  async createStockController(
    stockMedia: Stock,
    data: any,
    simulation: boolean,
  ) {
    if (stockMedia === undefined) {
      await this.databaseService.stock.create({
        data: { ...data, simulation: simulation, type: 'buy' },
      });
      await this.databaseService.stock.create({
        data: { ...data, simulation: simulation, type: 'media' },
      });
      return 'Nenhuma ação registrada, duas novas ações foram registradas';
    } else {
      await this.databaseService.stock.update({
        where: { id: stockMedia.id },
        data: {
          price:
            (stockMedia.price * stockMedia.qnt + data.price * data.qnt) /
            (stockMedia.qnt + data.qnt),
          qnt: stockMedia.qnt + data.qnt,
        },
      });
      await this.databaseService.stock.create({
        data: { ...data, simulation: simulation, type: 'buy' },
      });
      return 'Ação encontrada! Nova ação adicionada ao extrato';
    }
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

      const data = {
        ownerId: user.id,
        symbol: registerStockDto.symbol.toUpperCase(),
        qnt: registerStockDto.qnt,
        price: registerStockDto.price,
        longName: registerStockDto.longName,
        operationDate: opDate,
        type: 'buy',
      };

      const stockMedia = await this.findMediaStock(
        user,
        registerStockDto.symbol,
        false,
      );
      this.createStockController(stockMedia, data, false);

      return 'Ação registrada com sucesso';
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async simStock(simStockDto: SimStockDto, user: IUser) {
    try {
      if (!user.id) {
        throw new BadRequestException('Usuário não está logado');
      }
      const data = {
        symbol: simStockDto.symbol,
        longName: simStockDto.longName,
        price: simStockDto.price,
        qnt: simStockDto.qnt,
        ownerId: user.id,
        operationDate: new Date(),
        simulation: true,
        type: 'buy',
      };

      await this.databaseService.stock.create({
        data: data,
      });

      return 'Ação simulada com sucesso';
    } catch (error) {
      throw new BadRequestException(error);
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
    const stockInfoFromDB = await this.databaseService.stock.findUnique({
      where: {
        id: stockBodyInfo.id, //puxado do site
        ownerId: user.id,
      },
    });

    if (stockBodyInfo.qnt === undefined) {
      stockBodyInfo.qnt = stockInfoFromDB.qnt;
    } else {
    }
    if (!stockInfoFromDB) {
      throw new BadRequestException('Não foi encontrada a ação');
    }

    let quantity: number;
    console.log(
      'stockBodyInfo.qnt: ',
      stockBodyInfo.qnt,
      'response.data.results[0].qnt: ',
      stockInfoFromDB.qnt
    );
    if (stockBodyInfo.qnt <= stockInfoFromDB.qnt) {
      quantity = stockBodyInfo.qnt;
    } else {
      quantity = stockInfoFromDB.qnt;
    }
    console.log('quantity: ', quantity);

    const buyPriceRaw = stockInfoFromDB.price * quantity;

    //Obtendo valor da ação na venda
    let sellPrice: number;
    let singleSellPrice: number;
    let buyPriceCorrected: number;

    if (stockInfoFromDB.simulation) {
      //via API
      const response = await findStockBr(stockInfoFromDB.symbol);
      if (!response.data.results[0].regularMarketPrice) {
        sellPrice = 0;
      } else {
        singleSellPrice = response.data.results[0].regularMarketPrice;
        sellPrice = singleSellPrice * quantity;
      }

      

      const currentDate = new Date();
      const newDateSim = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        currentDate.getDate(),
      );
      buyPriceCorrected = await findInflation(
        stockInfoFromDB.operationDate,
        newDateSim,
        buyPriceRaw,
      );
    } else {
      //via body
      sellPrice = stockBodyInfo.sellPrice * quantity;
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
        stockInfoFromDB.operationDate,
        newDateReg,
        buyPriceRaw,
      );
    }

    let taxes: number;
    if (sellPrice > 20000) {
      taxes = (sellPrice - buyPriceCorrected) * 0.15;
    } else {
      taxes = 0;
    }

    const profit =
      sellPrice - buyPriceCorrected - taxes + stockBodyInfo.provents;

    const result = {
      stockName: stockInfoFromDB.longName,
      stockSymbol: stockInfoFromDB.symbol,
      paidPriceSingle: stockInfoFromDB.price,
      paidPrice: buyPriceCorrected,
      sellPriceSingle: sellPrice / stockBodyInfo.qnt,
      sellPrice: sellPrice,
      taxes: taxes,
      profit: profit,
      proportionalProfit: `${((profit / buyPriceCorrected) * 100).toFixed(2)}%`,
    };
    return result;
  }

  async sellStockController(user: IUser, stockBodyInfo: SellStockDto) {
    if (!user.id) {
      throw new BadRequestException('Usuário não está logado');
    }

    if (stockBodyInfo.simulation) {
      const dellStockDto: DellStockDto = {
        symbol: stockBodyInfo.symbol,
        simulation: stockBodyInfo.simulation,
        id: stockBodyInfo.id,
      };
      return this.deleteStock(dellStockDto);
    }

    const StockListToSell = await this.databaseService.stock.findMany({
      where: {
        symbol: stockBodyInfo.symbol,
        ownerId: user.id,
        simulation: false,
      },
    });

    const stockMedia = StockListToSell.find((stock) => stock.type === 'media');

    if (stockBodyInfo.qnt === undefined) {
      stockBodyInfo.qnt = stockMedia.qnt;
    }

    const price = stockMedia.price
      ? stockMedia.price
      : await this.searchStock(stockBodyInfo.symbol).then(
          (stock) => stock.Price,
        );

    const date = stockBodyInfo.date ? stockBodyInfo.date : new Date();

    return this.sellSomeStock(
      user,
      stockBodyInfo.qnt,
      stockMedia.id,
      price,
      date,
      stockMedia.simulation,
    );
  }

  async dellAllStock(user: IUser, stockToBeSoldList: any) {
    if (!user.id) {
      throw new BadRequestException('Usuário não está logado');
    }

    const idsToDelete = stockToBeSoldList.map((stock) => stock.id);
    await this.databaseService.stock.deleteMany({
      where: {
        id: {
          in: idsToDelete,
        },
      },
    });

    return 'Todas as ações do simbolo selecionado foram deletadas';
  }

  async sellSomeStock(
    user: IUser,
    qntToSell: number,
    id: number,
    price: number,
    date: Date,
    sim: boolean,
  ) {
    if (!user.id) {
      throw new BadRequestException('Usuário não está logado');
    }

    const product = await this.databaseService.stock.findUnique({
      where: { id: id, type: 'media' },
    });
    const result = product.qnt - qntToSell > 0 ? product.qnt - qntToSell : 0;

    if (result >= 0) {
      await this.databaseService.stock.update({
        where: { id: id },
        data: {
          qnt: result,
        },
      });

      const data = {
        ownerId: user.id,
        symbol: product.symbol,
        qnt: qntToSell,
        price: price,
        longName: product.longName,
        operationDate: date,
        simulation: sim,
        type: 'sell',
      };
      // console.log('data: ', data);
      await this.databaseService.stock.create({
        data: data,
      });
    } else {
      return 'Não é possivel vender mais ações do que as que foram compradas';
    }
    return 'Foram vendidas ' + qntToSell + ' ações';
  }

  async deleteStock(stock: DellStockDto) {
    console.log('stock: ', stock);
    if (stock.simulation) {
      await this.databaseService.stock.delete({
        where: {
          id: stock.id,
        },
      });
    } else {
      await this.databaseService.stock.deleteMany({
        where: {
          symbol: stock.symbol,
          simulation: stock.simulation,
        },
      });
    }
    return 'Ação deletada com sucesso';
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
    return 'A simulação foi deletada';
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
