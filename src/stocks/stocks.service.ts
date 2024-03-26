import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { IUser } from 'src/interfaces/IUser';
import axios from 'axios';

@Injectable()
export class StocksService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findOne(symbol: string) {
    try {
      const apiKey = 'XV6YFEP67P572IUP'; // Substitua pela sua chave de API
      const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
      return response.data;
    } catch (error) {
      throw new Error(`Erro ao obter informações da ação: ${error.message}`);
    }
  }

  async buyStock(createStockDto: CreateStockDto, symbol, user: IUser){
    console.log('Ação: ' + symbol);
    console.log('Qnt: ' + createStockDto);
    console.log('user name: ' + user.name);  
    console.log('user id: ' + user.id);  
    // try{
    //   const apiKey = 'XV6YFEP67P572IUP'; // Substitua pela sua chave de API
    //   const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
    //     if (response.data && response.data['Global Quote']) {
    //       const globalQuote = response.data['Global Quote'];
    //       const symbol = globalQuote['01. symbol'];
    //       const price = globalQuote['05. price'];
      
    //       // Crie um novo registro no banco de dados com os valores obtidos da resposta
    //       const newStock = await this.databaseService.product.create({
    //         data: {
    //           ownerId: user.id,
    //           symbol: symbol,
    //           price: price,
    //           qnt: createStockDto.qnt
    //         }
    //       });
    //       return newStock;
    //     } else {
    //       throw new Error('Resposta inválida da API');
    //     }
      
    //   //return 'A compra da ação ' + symbol + ' foi um sucesso';
    // } catch {
    //   throw new BadRequestException('Não foi possivel simular a compra da ação');
    // }
  }
}
