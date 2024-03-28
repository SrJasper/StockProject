import { IsNumber, IsOptional } from "class-validator"

export class SellStockDto {  
  @IsNumber({}, {message: 'Insira um id válido'})
  id: number;

  @IsOptional()
  @IsNumber({}, {message: 'Digite um valor de compra corrigido válido'})
  boughtPrice: number;

  @IsOptional()
  @IsNumber({}, {message: 'Digite um valor de venda válido'})
  sellPrice: number;
}