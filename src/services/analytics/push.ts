import {AnalyticsEvents} from "./events";
import {getCollector} from "./collector-type";
import {AnalyticEvents} from "./types/analytics";
import {error} from "../../utils/logger-handler";
import {ErrorMessages} from "../../types/error-messages";
import {AnalyticEventName} from "./types/events";
import {AnalyticTypes} from "./types/analytic-types";

export class Push {

  static getCollectors(name: AnalyticEventName) {
    return (name in AnalyticsEvents) ? AnalyticsEvents[name].map(getCollector) : [];
  }

  static async event(name: AnalyticEventName, params: any) {
    try {
      await Promise.allSettled(
        Push.getCollectors(name)
          .map(collector =>
            collector?.collect([{name, params}])));
    } catch (e) {
      error(ErrorMessages.FailedToCollectLog, e?.toString());
    }
  }

  static async events(payload: AnalyticEvents) {
    const events: { [k: string]: AnalyticEvents } = {};

    for (const event of payload) {
      const collectors = Push.getCollectors(event.name);
      for (const collector of collectors) {
        if (collector?.type)
          events[collector.type] = [...(events[collector.type] || []), event]
      }
    }

    try {
      await Promise.allSettled(
        Object.entries(events)
          .map(([type, events_1]) =>
            getCollector({type: type as AnalyticTypes})?.collect(events_1)));
    } catch (e) {
      error(ErrorMessages.FailedToCollectLog, e?.toString());
    }
  }
}