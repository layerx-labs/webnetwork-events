import axios from "axios";
import { Logger } from "src/utils/logger-handler";

const {
    NEXT_PUBLIC_CURRENCY_MAIN: currency,
    NEXT_ENABLE_COINGECKO: enableCoinGecko,
  } = process.env;

const COINGECKO_API = axios.create({baseURL: "https://api.coingecko.com/api/v3"});

async function getCoinPrice(search: string, fiat = currency) {
    Logger.changeActionName("coingecko")
    if (!enableCoinGecko){
      Logger.warn("enableCoinGecko env is disabled")
      return 0;
    }
  
    const coins = await COINGECKO_API.get(`/coins/list?include_platform=false`).then(value => value.data);

    if(!Array.isArray(coins))
        Logger.error(coins, "Error to get list coingecko")

    const symbols = search.toLowerCase().split(',')
    const coinsData = coins.filter(({symbol}) => symbols.includes(symbol))

    if (coinsData.length < 1){
      Logger.error(coinsData, "Error to filter symbol coingecko")
      return 0;
    }
      
    const ids = coinsData.map(({id}) => id).join()

    const price = await COINGECKO_API.get(`/simple/price?ids=${ids}&vs_currencies=${fiat || 'eur'}`);

    if (!price?.data){
      Logger.error(price.statusText, "Error to get prices coingecko")
      return 0;
    }
      
    const result: any = {}

    coinsData.map(({symbol, id}) => result[symbol] = {[fiat || 'eur']: price?.data?.[id]?.[fiat || 'eur']})

    return result
  }

export {
    getCoinPrice
}