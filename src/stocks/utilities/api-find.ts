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

export async function findInflation(date1raw: Date, date2raw: Date, value: number){

  
  const monthOne = date1raw.getMonth();
  const yearOne = date1raw.getFullYear();
  const formattedMonthOne = monthOne < 10 ? `0${monthOne}` : monthOne;
  const date1 = (`${yearOne}${formattedMonthOne}`);
 
  const dateTwo = new Date();
  const monthTwo = date2raw.getMonth();
  const yearTwo = date2raw.getFullYear();
  const formattedMonthTwo = monthTwo < 10 ? `0${monthTwo}` : monthTwo;
  const date2 = (`${yearTwo}${formattedMonthTwo}`);

  console.log(date1, date2);
  if(date1 === date2){
    console.log('datas iguiais');
    return value;
  }

  const res = await axios.get(`https://apisidra.ibge.gov.br/values/t/1737/p/${date1}, ${date2}/v/2266/n1/1`);
  console.log(res.data);
  const v1 = res.data[1].V;
  const v2 = res.data[2].V;
  let inflation: number;
  if(v1 > v2){
    inflation = v1 / v2;
  } else {
    inflation = v2 / v1;
  }
  const correctdValue = value * inflation;
  return correctdValue;
}

export function getDate(date: Date){
  const dateParts = date.toISOString().split('T')[0].split('-');
  const datefixed = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  return datefixed;
}

