import { IsDate, IsNumber, IsOptional } from "class-validator"

export class SellStockDto {
  id: number;

  @IsOptional()
  @IsNumber({}, {message: 'Digite um valor de venda válido'})
  sellPrice: number;

  @IsOptional()
  @IsNumber({}, {message: 'Digite um valor de venda válido'})
  provents: number = 0;
  
  @IsOptional()
  @IsDate({message: 'Digite o dia da venda'})
  date: Date = new Date();
}