import {AnalyticEventName} from "./events";
import {AnalyticTypes} from "./analytic-types";

export type CollectEventPayload = { name: string; params: any };
export type Analytic = { type: AnalyticTypes };
export type AnalyticEvent = { name: AnalyticEventName, params: any }
export type AnalyticEvents = AnalyticEvent[];
export type AnalyticEventPool = { [k in AnalyticEventName]?: Analytic[] }