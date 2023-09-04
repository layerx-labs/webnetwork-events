import 'dotenv/config';
import * as Handlebars from "handlebars";
import {readFileSync} from "node:fs";
import {join, resolve} from 'node:path'

const env_folder = process.env.TELEGRAM_TEMPLATE_FOLDER;
const folder = join(process.cwd(), env_folder || `src/integrations/telegram/message-template/`);

const file = (template: string) => resolve(folder, template);

export const _NEW_BOUNTY = (info) =>
  Handlebars.compile(readFileSync(file(`new-bounty.hbs`), 'utf-8'))(info, {allowProtoPropertiesByDefault: true});

export const AMOUNT_AND_SYMBOL = (info) =>
  Handlebars.compile(readFileSync(file(`amount-symbol.hbs`), 'utf-8'))(info, {allowProtoPropertiesByDefault: true});

export const _BOUNTY_STATE_CHANGED = (info) =>
  Handlebars.compile(readFileSync(file(`bounty-state-changed.hbs`), 'utf-8'))(info, {allowProtoPropertiesByDefault: true});

export const _BOUNTY_AMOUNT_UPDATED = (info) =>
  Handlebars.compile(readFileSync(file(`bounty-amount-changed.hbs`), 'utf-8'))(info, {allowProtoPropertiesByDefault: true});

export const _DELIVERABLE_OPEN = (info) =>
  Handlebars.compile(readFileSync(file(`deliverable-open.hbs`), 'utf-8'))(info, {allowProtoPropertiesByDefault: true});

export const _DELIVERABLE_CANCELED = (info) =>
  Handlebars.compile(readFileSync(file(`deliverable-canceled.hbs`), 'utf-8'))(info, {allowProtoPropertiesByDefault: true});

export const _PROPOSAL_CREATED = (info) =>
  Handlebars.compile(readFileSync(file(`proposal-created.hbs`), 'utf-8'))(info, {allowProtoPropertiesByDefault: true});

export const _PROPOSAL_DISPUTED = (info) =>
  Handlebars.compile(readFileSync(file(`proposal-disputed.hbs`), 'utf-8'))(info, {allowProtoPropertiesByDefault: true});

export const _PROPOSAL_DISPUTED_COMPLETE = (info) =>
  Handlebars.compile(readFileSync(file(`proposal-disputed-complete.hbs`), 'utf-8'))(info, {allowProtoPropertiesByDefault: true});

export const _PROPOSAL_READY = (info) =>
  Handlebars.compile(readFileSync(file(`proposal-ready.hbs`), 'utf-8'))(info, {allowProtoPropertiesByDefault: true});

export const _BOUNTY_CLOSED = (info) =>
  Handlebars.compile(readFileSync(file(`bounty-closed.hbs`), 'utf-8'))(info, {allowProtoPropertiesByDefault: true});

export const _BOUNTY_FUNDED = (info) =>
  Handlebars.compile(readFileSync(file(`bounty-funded.hbs`), 'utf-8'))(info);
