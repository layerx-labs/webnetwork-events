import axios, {type AxiosInstance} from "axios";
import * as process from "process";
import {CollectEventPayload} from "../types/analytics";
import {type networks} from "../db/models/networks";

const {GA_MEASURE_ID, GA_API_SECRET, GA_BASEURL} = process.env;

export default class GoogleMeasurement {
  readonly collector: AxiosInstance =
    axios.create({
      baseURL: GA_BASEURL || "https://www.google-analytics.com/mp/collect",
      method: "post",
      timeout: 10000,
      headers: {"Content-Type": "application/json"},
      params: {api_secret: GA_API_SECRET, measurement_id: GA_MEASURE_ID}
    });

  constructor(readonly network: networks, readonly chainId: number) {
  }

  get networkAndChainInfo() {
    const {name, id} = this.network;
    return {
      chainId: this.chainId,
      network: {name, id}
    }
  }

  public async collect<T = any>(events: CollectEventPayload[]) {
    return (await this.collector({data: {...this.networkAndChainInfo, events},}))?.data as T;
  }
}