import {CollectEventPayload} from "./types/analytics";
import {AnalyticTypes} from "./types/analytic-types";

export abstract class Collector<CollectorInstance = any, Collected = any> {
  abstract readonly type: AnalyticTypes;
  abstract readonly collector: CollectorInstance;

  public abstract collect(events: CollectEventPayload[]): Promise<Collected>;
}