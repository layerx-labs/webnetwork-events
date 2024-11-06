import axios from "axios";
import Logger from "src/utils/logger-handler";


const {
  NEXT_PUBLIC_CURRENCY_MAIN: currency,
  NEXT_ENABLE_COINGECKO: enableCoinGecko,
} = process.env;

const COINGECKO_API = axios.create({baseURL: "https://api.coingecko.com/api/v3"});

export async function getCoinIconByChainAndContractAddress(address: string, chainId: number): Promise<string | null> {
  const platforms = await COINGECKO_API.get(`/asset_platforms`).then((value) => value.data);

  const platformByChainId = platforms.find(({chain_identifier}) => chain_identifier === chainId)

  if (!platformByChainId) return null;

  const coin = await COINGECKO_API.get(`/coins/${platformByChainId.id}/contract/${address}`).then((value) => value.data).catch(() => null);

  if(!coin) return null;
  
  return coin?.image?.thumb
}


async function getCoinPrice(search: string, fiat = currency) {

  if (!enableCoinGecko) {
    Logger.warn("enableCoinGecko env is disabled")
    return 0;
  }

  const coins = await COINGECKO_API.get(`/coins/list?include_platform=false`).then(value => value.data);

  if (!Array.isArray(coins)) {
    Logger.warn(coins, "Error to get list coingecko")
    return 0;
  }


  const symbols = search.toLowerCase().split(',')
  const coinsData = coins.filter(({symbol}) => symbols.includes(symbol))

  if (coinsData.length < 1) {
    Logger.warn("Error to filter symbol coingecko", coinsData)
    return 0;
  }

  const ids = coinsData.map(({id}) => id).join()


  const price = await COINGECKO_API.get(`/simple/price?ids=${ids}&vs_currencies=${fiat || 'eur'}`);

  if (!price?.data) {
    Logger.warn(price.statusText, "Error to get prices coingecko")
    return 0;
  }

  const result: any = {}

  coinsData.map(({symbol, id}) => result[symbol] = {[fiat || 'eur']: price?.data?.[id]?.[fiat || 'eur']})

  return result
}

export {
  getCoinPrice
}