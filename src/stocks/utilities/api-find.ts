import { BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { stringify } from 'querystring';

export async function findStockBr(symbol:string): Promise <any> {
  const brapiKey = process.env.BRAPI_KEY;
  try {    
    const response = await axios.get(`https://brapi.dev/api/quote/${symbol}?token=${brapiKey}`);
    return response;
  } catch (error) {
    throw new BadRequestException ('Símbolo não encontrado');
  }
}

export async function findInflation(date1fromBody: Date, date2fromBody: Date, value: number){

  let date1raw = new Date(date1fromBody);
  let date2raw = new Date(date2fromBody);

  const date1string = date1raw.toISOString();
  const date2string = date2raw.toISOString();

  const date1 = date1string.slice(0, 4) + date1string.slice(5, 7);
  const date2 = date2string.slice(0, 4) + date2string.slice(5, 7);
  console.log(date1, date2);  

  console.log("datas: ", date1, date2);
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

