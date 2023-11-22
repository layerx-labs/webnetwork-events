import {send, setApiKey} from "@sendgrid/mail";
import process from "process";
import {ClientResponse} from "@sendgrid/client/src/response";
import loggerHandler from "../../../utils/logger-handler";

const {NEXT_SENDGRID_MAIL_API_KEY, NEXT_SENDGRID_MAIL_FROM} = process.env;

class EmailServiceFactory {
  constructor(private apiKey = NEXT_SENDGRID_MAIL_API_KEY, readonly from = NEXT_SENDGRID_MAIL_FROM) {
    if (!apiKey)
      throw new Error(`Needs "apiKey" field, NEXT_SENDGRID_MAIL_API_KEY`);

    if (!from)
      throw new Error(`Needs "from" field, NEXT_SENDGRID_MAIL_FROM`);

    setApiKey(apiKey);
  }

  async sendEmail(subject: string, bcc: string | string[], html: string): Promise<ClientResponse> {
    return new Promise((p, f) => {

      const sendCallback = (error: Error, [result,]: [ClientResponse, {}]) => {
        if (error) {
          f(error);
          loggerHandler.error(`Failed to send email (${subject})`, error?.toString());
        } else {
          p(result);
          loggerHandler.info(`Sent email (${subject})`);
        }
      }

      send({subject, text: subject, html, bcc, from: NEXT_SENDGRID_MAIL_FROM!}, false, sendCallback)
    });
  }
}

export const EmailService = new EmailServiceFactory();