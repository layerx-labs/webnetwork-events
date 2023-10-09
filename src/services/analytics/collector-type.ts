import {Analytic,} from "./types/analytics";
import {GoogleAnalyticsCollector} from "./collectors/google-analytics-collector";
import {error, warn} from "../../utils/logger-handler";
import {ErrorMessages} from "../../types/error-messages";
import {type Collector} from "./collector";
import {ElasticSearchScribal} from "./collectors/elastic-search-scribal";

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
        return new ElasticSearchScribal();
      default:
        warn(ErrorMessages.CollectorUnknown, {type});
        return null;
    }
  } catch (e) {
    error(`Failed to return collector`, e?.toString());
    return null;
  }
}