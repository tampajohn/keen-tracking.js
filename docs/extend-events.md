# Extend Events

These methods extend the event body of every event sent through `recordEvent()` or `recordEvents()`, for all or specified collections, and accepts either a predefined object (static) or a function that returns an object (dynamic). This returned object is then grafted into the original event body with a deep-extend operation that seamlessly blends nested objects.

`extendEvents` transforms will be applied first, followed by collection-specific `extendEvent` transforms. In either case, transforms will be applied in the order that they are defined. Properties provided in the originating `recordEvent/s()` call will override any matching properties (static or dynamic) returned by these methods.

```javascript
import PCTracking from 'pc-tracking';
const client = new PCTracking({ /*configure*/ });
// Extend events for a single collection
client.extendEvent('transaction', {});
client.extendEvent('transaction', () => {
  return {};
});

// Extend events for all collections
client.extendEvents({});
client.extendEvents(() => {
  return {};
});

// Example usage

const userProps = {
  full_name: 'User Dude',
  email: 'name@domain.com',
  id: 'f1233423h',
  username: 'userdude213'
};

// Include a predefined 'user' object with every purchase event
client.extendEvent('purchases', {
  'user': userProps
});

// Include a predefined 'user' object with every event
client.extendEvents({
  'user': userProps
});

// Include a dynamic 'pc.timestamp' property with every event
client.extendEvents(() => {
  return {
    pc: {
      timestamp: new Date().toISOString()
    }
  };
});
```

**Example usage:**

```javascript
import PCTracking from 'pc-tracking';
const client = new PCTracking({ /*configure*/ });

// Object (static)
client.extendEvents({
  user: {
    email: 'name@domain.com',
    id: 'f1233423h',
    username: 'someuser123'
  }
});

// Function that returns an object (dynamic)
// Useful for attaching time-sensitive data
client.extendEvents(() => {
  return {
    pc: {
      timestamp: new Date().toISOString()
    }
  }
});

//
client.recordEvent('pageviews');

/* Resulting event body:
{
  user: {
    email: 'name@domain.com',
    id: 'f1233423h',
    username: 'someuser123'
  },
  pc: {
    timestamp: '2015-06-28T22:01:38.824Z'
  }
}
*/
```
