import {Collector} from "../collector";
import {AnalyticTypes} from "../types/analytic-types";
import {CollectEventPayload} from "../types/analytics";
import {EmailNotification} from "../../../integrations/send-grid/notifications/email-notification";
import loggerHandler from "../../../utils/logger-handler";
import {ErrorMessages} from "../../../types/error-messages";
import {AnalyticEventName} from "../types/events";
import {ClientResponse} from "@sendgrid/client/src/response";

export class NotificationCollector implements Collector<undefined, ClientResponse[]> {
  readonly type = AnalyticTypes.EmailNotification;
  readonly collector: undefined;

  collect(events: CollectEventPayload[]): Promise<any> {
    const _collect = (event: CollectEventPayload) =>
      new EmailNotification(event.name as AnalyticEventName, event.params, event?.params?.target)
        .send()
        .catch(e => {
          loggerHandler.error(ErrorMessages.FailedToCollectEmailNotification, e?.toString())
        })

    return Promise.allSettled(events.map(_collect))
  }
}