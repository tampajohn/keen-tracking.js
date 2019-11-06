# Defer Events

These methods handle an internal queue of events, which is pushed to the [events](https://pc.io/docs/api/#record-multiple-events) API resource on a given interval (default: 15 seconds), or when the queue reaches a maximum capacity (default: 5000 events).

### Defer a single event

```javascript
import PCTracking from 'pc-tracking';

const client = new PCTracking({
  // projectId: '',
  // writeKey: '',

  // customize default values
  queue: {
    capacity: 5000, // maximum number of items
    interval: 15 // seconds
  }
});

client.deferEvent('purchase', {
  user_id: '35465434643'
  /* Data Model */
});
```

### Defer multiple events

```javascript
import PCTracking from 'pc-tracking';

const client = new PCTracking({ /*configure*/ });

client.deferEvents([
  'collection-1': [
    { user_id: '21325432423' /* Event Data Model */ },
    { user_id: '55421323121' /* Event Data Model */ }
  ],
  'collection-2': [ /* Multiple Events */ ]
]);
```


### Stop interval

Remove interval listener by calling `client.queue.pause();`

```javascript
// ...
client.queue.pause();
```

### Flush the queue

Flush all events currently queued by calling `client.recordDeferredEvents()`.

```javascript
import PCTracking from 'pc-tracking';

const client = new PCTracking({ /*configure*/ });

client.deferEvent('purchase', {
  /* Data Model */
});

client.recordDeferredEvents();
```
