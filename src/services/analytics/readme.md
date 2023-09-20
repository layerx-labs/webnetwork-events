# Collecting Analytics and Pushing events

## Pushing events

```ts
import {Push} from "push.ts";

// ... params: any
Push.event("name", params);
```

### Event names

Event names should be present on `events.ts`

## Collectors

Collectors are classes that should implement [BaseCollector](./collector.ts) class, having a `collect`
function that will work as a catch-all for the events that sends.

### Creating a new collector

See example on [GoogleAnalyticsCollector](./collectors/google-analytics-collector.ts)

1. import the base-collector
2. implement needed functionality and provide a `collect` function
3. add new type to `types/analytics.d.ts`
4. add the return in `collector-type.ts`
5. add the new event collector in the `events.ts` constant
