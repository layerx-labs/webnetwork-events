import { EventsQuery } from "src/interfaces/block-chain-service";

declare global {
  namespace Express {
    interface Request {
      eventQuery?: EventsQuery;
    }
  }
}
