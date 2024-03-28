import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { SelectStockDto } from './dto/select-stock.dto';
import { SellStockDto } from './dto/sell-stock.dto';
import { findStock } from './utilities/api-find';
import { IUser } from 'src/interfaces/IUser';

@Injectable()
export class StocksService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findOne(symbol: string) {
    try{
      const response = await findStock(symbol);
      return response;
    } catch {
      throw new BadRequestException('houve um erro');
    }
  }

  async findOneStock(symbol: string, user: IUser) {
    const stocks = await this.databaseService.stock.findMany({ where: {
      symbol: symbol,
      ownerId: user.id
    }});
    return stocks;
  }

  async listStocks( user: IUser ) {
    const stocks = await this.databaseService.stock.findMany({ where: { ownerId: user.id } });
    if(!stocks){
      throw new BadRequestException('Não foi encontrada nenhuma simulação de ação sendo feita');
    }
    return stocks;
  }

  async buyStock(createStockDto: CreateStockDto, symbol, user: IUser){
    try {
      if(!user.id){
        throw new BadRequestException('Usuário não está logado');
      }
      const response = await findStock(symbol);
      
      const newStock = await this.databaseService.stock.create({
        data: {
          ownerId: user.id,
          symbol: symbol,
          price: parseFloat(response['Global Quote']['05. price']),
          qnt: createStockDto.qnt
        }
      });
      return newStock;
    } catch (error) {
      throw new BadRequestException('Não foi possivel fazer a simulação de compra');
    }
  }

  async sellStock(user:IUser, stockInfo:SellStockDto){
    if(!user.id){
      throw new BadRequestException('Usuário não está logado');
    }
    const stockSoldInfo = await this.databaseService.stock.findUnique({ where: {
      id: stockInfo.id,
      ownerId: user.id
    }});
    if(!stockSoldInfo){
      throw new BadRequestException('Não foi encontrada a ação');
    }
    let price: number;
    if(!stockInfo.sellPrice){
      console.log('Puxa o preço pela API');
      const response = await findStock(stockSoldInfo.symbol);
      console.log(response);
      price = parseFloat(response['Global Quote']['05. price']);      
    } else {
      price = stockInfo.sellPrice;
    }

    //É preciso completar esses dados
    const result = {
      paidPrice: stockSoldInfo.price,
      sellPrice: stockInfo.sellPrice,
      lucro: price - stockSoldInfo.price,
    };

    return result;
}

  async deleteSimStock(user:IUser, id:SelectStockDto){
    if(!user.id){
      throw new BadRequestException('Usuário não está logado');
    }
    await this.databaseService.stock.deleteMany({ where: {
      id: id.id,
      ownerId: user.id
    }});
    return 'A simulção foi deletada'
  }

  async clearUserStocks(user: IUser){
    if(!user.id){
      throw new BadRequestException('Usuário não está logado');
    }
    try {      
      await this.databaseService.stock.deleteMany({ where: { ownerId: user.id } });
      return 'As simulações desse usuário foram deletadas'
    } catch (error) {
      throw new BadRequestException('Não foi possivel deletar as simulações desse usuário');      
    }
  }

  /*
  async testPython(){
    console.log('Enrou na rota');
    // exec('python3 shell.py', (error, stdout, stderr) => {
    //   if (error) {
    //     console.log(`error: ${error.message}`);
    //   }
    //   else if (stderr) {
    //     console.log(`stderr: ${stderr}`);
    //   }
    //   else {
    //     console.log(stdout);
    //   }
    // })
  }
  */
}
