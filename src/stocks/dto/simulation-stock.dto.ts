import { IsNumber } from "class-validator"

export class SimStockDto {  
  @IsNumber({},{message: 'Insira uma quantidade de produtos que foram comprados'})
  qnt: number;
  
  symbol: string;
  longName: string;
  price: number;

}