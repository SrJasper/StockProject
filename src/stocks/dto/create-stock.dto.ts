import { IsNumber, IsOptional} from "class-validator"

export class CreateStockDto {  
  @IsNumber({},{message: 'Insira uma quantidade de produtos no estoque'})
  qnt: number;

  @IsOptional()
  @IsNumber({}, {message: 'Insira um número válido'})
  price: number;
}