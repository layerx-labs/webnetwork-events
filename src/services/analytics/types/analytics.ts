import {AnalyticEventName} from "./events";
import {AnalyticTypes} from "./analytic-types";

export type CollectEventPayloadParams = { bountyId: number; [key: string]: any };
export type CollectEventPayload = { name: string; params: CollectEventPayloadParams };
export type Analytic = { type: AnalyticTypes };
export type AnalyticEvent = { name: AnalyticEventName, params: any }
export type AnalyticEvents = AnalyticEvent[];
export type AnalyticEventPool = { [k in AnalyticEventName]?: Analytic[] }