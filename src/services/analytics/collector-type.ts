import {Analytic,} from "./types/analytics";
import {GoogleAnalyticsCollector} from "./collectors/google-analytics-collector";
import {error, warn} from "../../utils/logger-handler";
import {ErrorMessages} from "../../types/error-messages";
import {type Collector} from "./collector";
import {ElasticSearch} from "./collectors/elastic-search";
import {SendGridEmailNotification} from "./collectors/send-grid-email-notification";
import {CreateNotification} from "./collectors/create-notification";

/**
 *
 * @param type {Analytic}
 * @return {Collector|null}
 */
export function getCollector({type}: Analytic): Collector | null {
  try {
    switch (type) {
      case "ga4":
        return new GoogleAnalyticsCollector();
      case "elastic-search":
        return new ElasticSearch();
      case "send-grid-email-notif":
        return new SendGridEmailNotification();
      case "create-notification":
        return new CreateNotification();
      default:
        warn(ErrorMessages.CollectorUnknown, {type});
        return null;
    }
  } catch (e) {
    error(`Failed to return collector ${type}`, e?.toString());
    return null;
  }
}