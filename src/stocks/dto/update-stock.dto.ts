import { PartialType } from '@nestjs/mapped-types';
import { RegisterStockDto } from './register-stock.dto';

export class UpdateStockDto extends PartialType(RegisterStockDto) {}
