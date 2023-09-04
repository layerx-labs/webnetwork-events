## Telegram integration

### Create a Telegram Bot

Creating a bot is streamlined by Telegram’s Bot API, which gives the tools and framework required to integrate your
code. To get started, message @BotFather on Telegram to register your bot and receive its authentication token.

**Your bot token is its unique identifier – store it in a secure place, and only share it with people who need direct
access to the bot. Everyone who has your token will have full control over your bot.**

### Environments

```dotenv
TELEGRAM_TOKEN="API token returned by @BotFather"
TELEGRAM_CHANNELS=["@Channel1", "@Channel2"]

# Template folder for the telegram messages
TELEGRAM_TEMPLATE_FOLDER=
```

### As a channel admin

Add the bot to the channel as you normally would by inviting it and making it admin

### Messages

Can be edited in [`src/integrations/telegram/messages.ts`](./messages.ts)

### Sending Messages

#### No template, simple message

```typescript
import {sendMessageToTelegramChannels} from "./integrations/telegram";

sendMessageToTelegramChannels(`message`);
```

#### Templates

Templates are defaulted to `./message-templates` and are made with handlebars.    
You can provide a path _at build time_ by configuring `TELEGRAM_TEMPLATE_FOLDER`.

**NOTE** if you provide a custom folder you will have to provide all files and with the same name as the ones
in `./message-templates/`.

You can see what each template has access to, and the types, by inspecting `./messages.ts`

```typescript
export const NEW_BOUNTY_OPEN = (dbBounty: issues) => { /** implementation */
}
export const BOUNTY_STATE_CHANGED = (newState: string, dbBounty: issues) => { /** implementation */
}
export const BOUNTY_AMOUNT_UPDATED = (newPrice: string, dbBounty: issues) => { /** implementation */
}
export const DELIVERABLE_OPEN = (dbBounty: issues, deliverableId: string) => { /** implementation */
}
export const DELIVERABLE_CANCELED = (dbBounty: issues, deliverableId: string) => { /** implementation */
}
export const PROPOSAL_CREATED = (dbBounty: issues, proposal: merge_proposals, proposalId) => { /** implementation */
}
export const PROPOSAL_DISPUTED = (value: string, votes: string, dbBounty: issues, proposal: merge_proposals, proposalId: string) => { /** implementation */
}
export const PROPOSAL_DISPUTED_COMPLETE = (dbBounty: issues, proposal: merge_proposals, proposalId: string) => { /** implementation */
}
export const PROPOSAL_READY = (dbBounty: issues, proposal: merge_proposals, proposalId: string) => { /** implementation */
}
export const BOUNTY_CLOSED = (dbBounty: issues, proposal: merge_proposals, proposalId: string) => { /** implementation */
}
export const BOUNTY_FUNDED = (funded: string, total: string, dbBounty: issues) => { /** implementation */
}
```