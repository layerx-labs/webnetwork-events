import {AnalyticType, CollectEventPayload} from "./types/analytics";

export abstract class Collector<CollectorInstance = any, Collected = any> {
  abstract readonly type: AnalyticType;
  abstract readonly collector: CollectorInstance;

  public abstract collect(events: CollectEventPayload[]): Promise<Collected>;
}