import { IsNumber} from "class-validator"

export class SelectStockDto {  
  @IsNumber({}, {message: 'Insira um id válido'})
  id: number;
}