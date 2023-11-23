import {AnalyticsEvents} from "./events";
import {getCollector} from "./collector-type";
import {AnalyticEvents} from "./types/analytics";
import {error} from "../../utils/logger-handler";
import {ErrorMessages} from "../../types/error-messages";
import {AnalyticEventName} from "./types/events";

export class Push {

  static getCollectors(name: AnalyticEventName) {
    return (name in AnalyticsEvents) ? (AnalyticsEvents[name] || []).map(getCollector) : [];
  }

  static async event(name: AnalyticEventName, params: any) {
    return Push.events([{name, params}]);
  }

  static async events(payload: AnalyticEvents) {

    try {
      for (const event of payload) {
        const collectors = Push.getCollectors(event.name);
        for (const collector of collectors) {
          if (collector?.type)
            await collector.collect(JSON.parse(JSON.stringify(event)))
        }
      }
    } catch (e) {
      error(ErrorMessages.FailedToCollectLog, e?.toString());
    }
  }
}