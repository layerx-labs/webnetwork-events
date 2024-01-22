import {Collector} from "../collector";
import {ClientResponse} from "@sendgrid/client/src/response";
import {AnalyticTypes} from "../types/analytic-types";
import {CollectEventPayload} from "../types/analytics";
import {error} from "../../../utils/logger-handler";
import {ErrorMessages} from "../../../types/error-messages";
import {Notification} from "../../../integrations/notifications/notification";

export class CreateNotification implements Collector<undefined, ClientResponse[]> {
  readonly type = AnalyticTypes.CreateNotification;
  readonly collector: undefined;

  collect(events: CollectEventPayload[]): Promise<any> {

    const _collect = (event: CollectEventPayload) =>
      Notification.create(event.name, event?.params)
        .catch(e => {
          error(ErrorMessages.FailedToCreateNotification, e?.stack);
        })

    return Promise.allSettled(events.map(_collect))
  }
}