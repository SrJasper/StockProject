import { IsNumber, IsString} from "class-validator"

export class CreateStockDto {
  @IsString({message: 'O nome da ação é obrigatoria!'})
  symbol: string;
  
  @IsNumber({},{message: 'Insira uma quantidade de produtos no estoque'})
  qnt: number;
}