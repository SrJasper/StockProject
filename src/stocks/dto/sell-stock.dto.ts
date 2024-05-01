import { IsDate, IsNumber, IsOptional } from "class-validator"

export class SellStockDto {
  @IsNumber({}, {message: 'id não encontrado'})
  id: number;

  @IsOptional()
  @IsNumber({}, {message: 'Digite um valor de venda válido'})
  sellPrice: number;

  @IsOptional()
  @IsNumber({}, {message: 'Digite um valor de venda válido'})
  provents: number;
  
  @IsOptional()
  @IsDate({message: 'Digite o dia da venda'})
  date: Date;
}