import { IsDate, IsNumber, IsString } from "class-validator"

export class RegisterStockDto {
  @IsString({ message: 'Insira o símbolo da ação adquirida' })
  symbol: string;

  @IsString({ message: 'Insira o nome da empresa da ação adquirida' })
  longName: string;

  @IsNumber({}, { message: 'Insira o valor que foi pago na hora da compra' })
  price: number;
  
  @IsNumber({}, { message: 'Insira uma quantidade de produtos que foram comprados' })
  qnt: number;

  @IsDate({ message: 'Insira a data da compra' })
  operationDate: Date;
}