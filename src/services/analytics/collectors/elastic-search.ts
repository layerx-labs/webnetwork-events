import {Collector} from "../collector";
import {AnalyticTypes} from "../types/analytic-types";
import {CollectEventPayload} from "../types/analytics";
import {Client} from "@elastic/elasticsearch";
import {ErrorMessages} from "../../../types/error-messages";
import Logger from "../../../utils/logger-handler";

const {
  NEXT_ELASTIC_SEARCH_URL: node,
  NEXT_ELASTIC_SEARCH_USERNAME: username,
  NEXT_ELASTIC_SEARCH_PASSWORD: password,
  LOG_APP_NAME: index = "bepro-events"
} = process.env;

export class ElasticSearch implements Collector {
  readonly type = AnalyticTypes.ElasticSearch;
  readonly collector = new Client({node, auth: {username: username!, password: password!}});

  constructor() {
    if ([username, password].some(v => !v))
      throw new Error(ErrorMessages.MissingParamsElasticSearch);
  }

  public async collect(events: CollectEventPayload[]): Promise<any> {
    const _collect = (document: CollectEventPayload) =>
      this.collector.index({index: `bepro-business-events-${index}`, document})

    try {
      return await Promise.all(events.map(_collect));
    } catch (e: any) {
      Logger.error(e?.toString());
    }
  }
}