import {MIDNIGHT_ACTIONS, MINUTE_ACTIONS} from "./modules/chain-events";
import loggerHandler from "./utils/logger-handler";
import {differenceInMilliseconds, formatDistance} from "date-fns";
import {GlobalCatcher} from "./utils/global-catcher";

GlobalCatcher();

function startTimedEvents() {

  const startTimeoutForMidnightAction = (key, callback) => {
    const now = new Date();
    const next24 = new Date().setHours(24, 0, 0, 0);
    const diff = differenceInMilliseconds(next24, now);

    loggerHandler.info(`_scheduler calling ${key} in ${formatDistance(next24, now)}`);

    setTimeout(() => {
      try {
        loggerHandler.debug(`_scheduler midnight calling ${key}`);
        callback();
        startTimeoutForMidnightAction(key, callback); // start itself when over
      } catch (e) {
        loggerHandler.error(`_scheduler Midnight:${key}`, e);
      }
    }, diff);

  }

  const startIntervalForMinuteAction = (key, callback) => {
    loggerHandler.info(`_scheduler calling ${key} in about a minute`);

    setInterval(() => {
      try {
        loggerHandler.info(`_scheduler minute calling ${key}`);
        callback();
      } catch (e: any) {
        loggerHandler.error(`_scheduler Minute:${key}`, e?.stack);
      }
    }, 1000 * 60);
  }

  Object.entries(MIDNIGHT_ACTIONS).forEach(([k, cb]) => startTimeoutForMidnightAction(k, cb))
  Object.entries(MINUTE_ACTIONS).forEach(([k, cb]) => startIntervalForMinuteAction(k, cb))

}

(async () => {
  startTimedEvents();
})()
  .catch(e => {
    loggerHandler.info(`Scheduler Error outside the global catcher`, e);
  })


