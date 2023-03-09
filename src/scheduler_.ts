import {cronModuleActions, getModules} from 'cron-module-actions';
import {GlobalCatcher} from "./utils/global-catcher";
// import "elastic-apm-node/start"; // APM makes too much noise and can't correlate txs
import Scribal from "./utils/scribal";

GlobalCatcher();

export default (async () => {
  Scribal.i(`Scheduler starting...`);
  cronModuleActions(await getModules(`./dist/src/actions`));
})()
  .catch(e => {
    Scribal.i(`Scheduler Error outside the global catcher`, e);
  })