import axios from 'axios';

export async function findStock(symbol: string): Promise<any> {
  const apiKey = process.env.API_KEY;
  const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
  return response.data;
}
