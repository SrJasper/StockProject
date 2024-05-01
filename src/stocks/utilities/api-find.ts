import axios from 'axios';

export async function findStockBr(symbol:string): Promise <any> {
  const brapiKey = process.env.BRAPI_KEY;
  const response = await axios.get(`https://brapi.dev/api/quote/${symbol}?token=${brapiKey}`);
  return response;
}

export async function findInflation(date1: Date, date2: Date){
  const brapiKey = process.env.BRAPI_KEY;
  const formattedDate1 = date1.toISOString().split('T')[0];
  const formattedDate2 = date2.toISOString().split('T')[0];

  try {
    const response = await axios.get(`https://brapi.dev/api/v2/inflation?country=brazil&start=${formattedDate1}&end=${formattedDate2}&sortBy=date&sortOrder=desc&token=${brapiKey}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter dados de inflação:', error);
    throw error;
  }
}

