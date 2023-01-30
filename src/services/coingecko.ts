import axios from "axios";

const {
    NEXT_PUBLIC_CURRENCY_MAIN: currency,
    NEXT_ENABLE_COINGECKO: enableCoinGecko,
  } = process.env;

const COINGECKO_API = axios.create({baseURL: "https://api.coingecko.com/api/v3"});

async function getCoinPrice(search: string, fiat = currency) {
    if (!enableCoinGecko)
      return 0;
  
    const coins = await COINGECKO_API.get(`/coins/list?include_platform=false`).then(value => value.data);
    const coinEntry = coins.find(({symbol}) => symbol === search.toLowerCase());

    if (!coinEntry)
      return 0;
  
    const price = await COINGECKO_API.get(`/simple/price?ids=${coinEntry.id}&vs_currencies=${fiat || 'eur'}`);

    if (!price?.data?.[coinEntry.id][fiat || 'eur'])
      return 0;
  
    return price?.data?.[coinEntry.id][fiat || 'eur'];
  }

export {
    getCoinPrice
}