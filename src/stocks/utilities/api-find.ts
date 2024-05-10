import { BadRequestException } from '@nestjs/common';
import axios from 'axios';

export async function findStockBr(symbol:string): Promise <any> {
  const brapiKey = process.env.BRAPI_KEY;
  try {    
    const response = await axios.get(`https://brapi.dev/api/quote/${symbol}?token=${brapiKey}`);
    return response;
  } catch (error) {
    throw new BadRequestException ('Símbolo não encontrado');
  }
}

export async function findInflation(date1raw: Date, date2raw: Date){
  
  return 'not implemented yet';
}

export function getDate(date: Date){
  const dateParts = date.toISOString().split('T')[0].split('-');
  const datefixed = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  return datefixed;
}

