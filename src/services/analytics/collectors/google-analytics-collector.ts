import {Collector} from "../collector";
import axios, {AxiosInstance} from "axios";
import process from "process";
import {AnalyticType, CollectEventPayload} from "../../../types/analytics";
import {ErrorMessages} from "../../../types/error-messages";

const {GA_MEASURE_ID, GA_API_SECRET, GA_BASEURL} = process.env;

export class GoogleAnalyticsCollector implements Collector {
  readonly type: AnalyticType = "ga4";
  readonly collector: AxiosInstance =
    axios.create({
      baseURL: GA_BASEURL || "https://www.google-analytics.com/mp/collect",
      method: "post",
      timeout: 10000,
      headers: {"Content-Type": "application/json"},
      params: {api_secret: GA_API_SECRET, measurement_id: GA_MEASURE_ID}
    });

  constructor() {
    if ([GA_MEASURE_ID, GA_API_SECRET, GA_BASEURL].some(v => !v))
      throw new Error(ErrorMessages.MissingParamsGA)
  }

  public async collect(events: CollectEventPayload[]) {
    return (await this.collector({data: {events},}))?.data;
  }
}