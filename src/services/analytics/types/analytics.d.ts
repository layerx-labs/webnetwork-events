import {AnalyticEventName} from "./events";

export type CollectEventPayload = { name: string; params: any };
export type AnalyticType = "ga4";
export type Analytic = { type: AnalyticType };
export type AnalyticEvent = { name: AnalyticEventName, params: any }
export type AnalyticEvents = AnalyticEvent[];