# pc-tracking.js

A JavaScript tracking library for [PC](https://pc.io).
Track events, user actions, clicks, pageviews, conversions and more!

### Installation

Install this package from NPM *Recommended*

```ssh
npm install pc-tracking --save
```

Or load it from public CDN

```html
<script crossorigin src="https://cdn.jsdelivr.net/npm/pc-tracking@4"></script>
```

### Project ID & API Keys

[Login to PC IO to create a project](https://pc.io/login?s=gh_js) and grab the **Project ID** and **Write Key** from your project's **Access** page.

## Getting started

The following examples demonstrate how to implement rock-solid web analytics, capturing **pageviews**, **clicks**, and **form submissions** with robust data models.

[Full documentation is available here](./docs/README.md)

**Using React? Check out these setup guides:**

* [React Flux Logger](./docs/examples/react-flux): How to instrument a Flux ReduceStore
* [React Redux Middleware](./docs/examples/react-redux-middleware): How to instrument a Redux Store

**Upgrading from an earlier version of pc-js?** [Read this](./docs/upgrade-guide.md).

---

### Record an Event

```javascript
import PCTracking from 'pc-tracking';

const client = new PCTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY'
});

client
  .recordEvent('purchases', {
    item: 'Avocado',
    number_of_items: 10,
    user: {
      name: 'John Smith'
    }
  })
  .then((response) => {
    // handle successful responses
  })
  .catch(error => {
    // handle errors
  });
```

---

### Automated Event Tracking

Automatically record `pageviews`, `clicks`, and `form_submissions` events with robust data models:

```html
<script>
  (function(name,path,ctx){ctx[name]=ctx[name]||{ready:function(fn){var h=document.getElementsByTagName('head')[0],s=document.createElement('script'),w=window,loaded;s.onload=s.onerror=s.onreadystatechange=function(){if((s.readyState&&!(/^c|loade/.test(s.readyState)))||loaded){return}s.onload=s.onreadystatechange=null;loaded=1;ctx[name].ready(fn)};s.async=1;s.src=path;h.parentNode.insertBefore(s,h)}}})
  ('PCTracking', 'https://cdn.jsdelivr.net/npm/pc-tracking@4/dist/pc-tracking.min.js', this);

  PCTracking.ready(function(){
    const client = new PCTracking({
      projectId: 'YOUR_PROJECT_ID',
      writeKey: 'YOUR_WRITE_KEY'
    });
    client.initAutoTracking();
  });
</script>
```

[Learn how to configure and customize this functionality here](./docs/auto-tracking.md)

---

### Pageview Tracking

First, let's create a new `client` instance with your Project ID and Write Key, and use the `.extendEvents()` method to define a solid baseline data model that will be applied to every single event that is recorded. Consistent data models and property names make life much easier later on, when analyzing and managing several event streams. This setup also includes our [data enrichment add-ons](https://pc.io/docs/streams/data-enrichment-overview/), which will populate additional information when an event is received on our end.

```javascript
import PCTracking from 'pc-tracking';

const client = new PCTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY'
});
const helpers = PCTracking.helpers;
const utils = PCTracking.utils;

const sessionCookie = utils.cookie('rename-this-example-cookie');
if (!sessionCookie.get('guest_id')) {
  sessionCookie.set('guest_id', helpers.getUniqueId());
}

// optional
client.extendEvents(() => {
  return {
    geo: {
      ip_address: '${pc.ip}',
      info: {
        /* Enriched data from the API will be saved here */
        /* https://pc.io/docs/api/?javascript#ip-to-geo-parser */
      }
    },
    page: {
      title: document.title,
      url: document.location.href,
      info: { /* Enriched */ }
    },
    referrer: {
      url: document.referrer,
      info: { /* Enriched */ }
    },
    tech: {
      browser: helpers.getBrowserProfile(),
      user_agent: '${pc.user_agent}',
      info: { /* Enriched */ }
    },
    time: helpers.getDatetimeIndex(),
    visitor: {
      guest_id: sessionCookie.get('guest_id')
      /* Include additional visitor info here */
    },
    pc: {
      addons: [
        {
          name: 'pc:ip_to_geo',
          input: {
            ip: 'geo.ip_address'
          },
          output : 'geo.info'
        },
        {
          name: 'pc:ua_parser',
          input: {
            ua_string: 'tech.user_agent'
          },
          output: 'tech.info'
        },
        {
          name: 'pc:url_parser',
          input: {
            url: 'page.url'
          },
          output: 'page.info'
        },
        {
          name: 'pc:referrer_parser',
          input: {
            referrer_url: 'referrer.url',
            page_url: 'page.url'
          },
          output: 'referrer.info'
        }
      ]
    }
  }
});

// record the event
client
  .recordEvent('pageviews', {
    // here you can add even more data
    // some_key: some_value
  })
  .then((response) => {
    // handle responses
  }).catch(error => {
    // handle errors
  });
```

Every event that is recorded will inherit this baseline data model. Additional properties defined in `client.recordEvent()` will be applied before the event is finally recorded.

**What else can this SDK do?**

* [Automated tracking (browser-only)](./docs/auto-tracking.md)
* [Record multiple events in batches](./docs/record-events.md)
* [Extend event data models for a single event stream](./docs/extend-events.md)
* [Queue events to be recorded at a given time interval](./docs/defer-events.md)

**App Frameworks:**

* [React Flux Logger](./docs/examples/react-flux): How to instrument a Flux ReduceStore
* [React Redux Middleware](./docs/examples/react-redux-middleware): How to instrument a Redux Store
* [Vue.js Vuex Store](./docs/examples/vue-vuex): How to instrument a Vue Vuex Store

**Video Players:**

* [Facebook video player](./docs/examples/video/facebook-video)
* [HTML5 video player](./docs/examples/video/html5)
* [Video.js player](./docs/examples/video/video-js)
* [Vimeo video player](./docs/examples/video/vimeo)
* [Youtube iFrame video player](./docs/examples/video/youtube)

[Full documentation is available here](./docs/README.md)

---

### Click and Form Submit Tracking

Clicks and form submissions can be captured with `.listenTo()`. This function intercepts events for designated elements and creates a brief 500ms delay, allowing an HTTP request to execute before the page begins to unload.

This example further extends the `client` instance defined previously, and activates a simple timer when the page the loaded. Once a `click` or `submit` event is captured, the timer's value will be recorded as `visitor.time_on_page`.

```javascript
import PCTracking from 'pc-tracking';

const client = new PCTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY'
});
const helpers = PCTracking.helpers;
const timer = PCTracking.utils.timer();
timer.start();

PCTracking.listenTo({
  'click .nav a': (e) => {
    return client.recordEvent('click', {
      action: {
        intent: 'navigate',
        target_path: helpers.getDomNodePath(e.target)
      },
      visitor: {
        time_on_page: timer.value()
      }
    });
  },
  'submit form#signup': (e) => {
    return client.recordEvent('form-submit', {
      action: {
        intent: 'signup',
        target_path: helpers.getDomNodePath(e.target)
      },
      visitor: {
        email_address: document.getElementById('signup-email').value,
        time_on_page: timer.value()
      }
    });
  }
});
```

Click events (`clicks`) will record specific attributes from the clicked element or its ancestor elements and pass them via the `element` property in the event object data:
```javascript
// event object
{
    // ...

    // specific to the clicks event type
    "element": {
      "action" : undefined,                 // [DIRECT]
      "class": "cta",                       // [DIRECT]
      "href": "https://pc.io/plans/",     // [INHERITED]
      "id": "main-cta",                     // [INHERITED]
      "event_key": "learn-more-cta",        // [INHERITED] from the `data-event-key` attribute
      "method": "learn-more-link",          // [DIRECT]
      "node_name": "A",                     // [DIRECT]
      "selector": "body > div:eq(0) > div:eq(1) > div:eq(0) > a", // [DIRECT]
      "text": "Learn More",                 // [INHERITED]
      "title": "Learn More",                // [INHERITED]
      "type": undefined,                    // [DIRECT]
      "x_position": 191,                    // [DIRECT]
      "y_position": 970                     // [DIRECT]
  }
}
```

In the above list of collected properties for a click event, some properties are gathered from the nearest ancestor elements if they can't be found on the immediate source element of the event.  These properties are shown with `[INHERITED]` above.

For example, a click on the word `clicked!` below:
```html
  <a href='foo.html' data-event-key='click-me-cta'>
    <span id='contrived-example'>I want to be <strong class='enhance'>clicked!</strong></span>
  </a>
```

Would generate an event including a mixture of immediate attributes and attributes found by traversing up the DOM tree:
```js
{
  // ...
  "id" : "contrived-example",
  "class" : "enhance",
  "text" : "clicked!",
  "href" : "foo.html",
  "node_name" : "STRONG",
  "event_key" : "click-me-cta",
}
```
**Note:** The `event_key` value (`data-event-key` attribute) is a more explicit pc-specific identifier that gives you an option outside of `href`, `id`, and `class` values to group or identify and query clicks in a meaningful way without potential ID/class collisions or dual-use naming schemes.

Want to get up and running faster? This can also be achieved in the browser with [automated event tracking](./docs/auto-tracking.md).

---

### Block Bots and Improve Device Recognition

Install [mobile-detect.js](https://github.com/hgoebl/mobile-detect.js) to identify basic device types and block noisy bots and crawlers.

```ssh
npm install mobile-detect --save
```

This example further extends the `client` instance defined above, inserting a new `tech.device_type` property with three possible values: `'desktop'`, `'mobile'`, and `'tablet'`. If the user agent is determined to be a bot, it may be ideal to abort and avoid recording an event.

```javascript
import MobileDetect from 'mobile-detect';

const md = new MobileDetect(window.navigator.userAgent);
if (md.is('bot')) {
  return false;
}

// extends client instance defined previously
client.extendEvents(() => {
  return {
    tech: {
      device_type: md.tablet() ? 'tablet' : md.mobile() ? 'mobile' : 'desktop'
    }
  };
});
```

Check out the many additional methods supported by [mobile-detect.js](https://github.com/hgoebl/mobile-detect.js) to further enrich your data model.

This can also be used with [automated event tracking](./docs/auto-tracking.md).

---

### Server-side Event Tracking

```javascript
const PCTracking = require('pc-tracking');

const client = new PCTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY'
});

// promise
client
  .recordEvent('purchases', {
    item: 'Avocado',
    number_of_items: 10,
    user: {
      name: 'John Promise'
    }
  })
  .then((response) => {
    // handle successful responses
  })
  .catch(error => {
    // handle errors
  });

// or callback
client
  .recordEvent('purchases', {
    item: 'Avocado',
    number_of_items: 10,
    user: {
      name: 'John Callback'
    }
  }, (error, response) => {
    if (error) {
      // handle errors
      return;
    }
    // handle responses
  });
```

---

### Handling connection problems

When PCTracking encounters connection problems, it will retry to send the data.

```javascript
import PCTracking from 'pc-tracking';

const client = new PCTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY',

  // customize the default values
  retry: {
    limit: 10, // how many times retry to record an event
    initialDelay: 200, // initial delay between consecutive calls.
    // Each next retry will be delayed by (2^retries_count * 100) milliseconds,
    retryOnResponseStatuses: [ // array of invalid http response statuses
      408,
      500,
      502,
      503,
      504
    ]
  }
});
```

---

### Unique events

Save the event only once.

```javascript
client
  .recordEvent({
    collection: 'unique_clicks',
    event: {
      some_key: 'some_value',
      // ...
    },
    unique: true, // check if the event is unique, before sending to API
    cache: {
      storage: 'indexeddb', // for persistence. Remove this property to use RAM
      hashingMethod: 'md5', // remove this property to store as a stringified json
      maxAge: 1000 * 60, // store the information about unique value for 60 seconds
    }
  })
  .then((response) => {
    console.log('ok', response);
  })
  .catch(someError => {
    console.log('error', someError);
  });
```

---

### Request types

By default, we make requests using the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

For UI interactions, consider using the
[BeaconAPI](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API).
It's the fastest non-invasive way to track user behaviour.
Due to its nature, BeaconAPI runs requests in the background, with no possibility
to handle errors. If you want to handle errors, you need to use the Fetch API.

```javascript
// specify request types for all requests
const client = new PCTracking({
  projectId: 'PROJECT_ID',
  writeKey: 'WRITE_KEY',
  requestType: 'fetch' // fetch, beaconAPI, img
});

// you can use different requestType for a single request
client
  .recordEvent({
    collection: 'clicks',
    event: {
      some_key: 'some_value',
      // ...
    },
    requestType: 'beaconAPI'
  });
```

---

### Recorded Event ID

A successful response from our API does not contain the ID of the newly created event. We are using Cassandra Database (NoSQL), so there are no joins. Store all necessary data in each event you record.
Denormalization and duplication of data is a fact of life with Cassandra.
Read more:
- [Cassandra Modeling Guide](https://www.datastax.com/dev/blog/basic-rules-of-cassandra-data-modeling)
- [How not to use Cassandra](https://opencredo.com/how-not-to-use-cassandra-like-an-rdbms-and-what-will-happen-if-you-do/)
---

### Contributing

This is an open source project and we love involvement from the community! Hit us up with pull requests and issues.

[Learn more about contributing to this project](./CONTRIBUTING.md).

---

### Support

Need a hand with something? Shoot us an email at [team@pc.io](mailto:team@pc.io). We're always happy to help, or just hear what you're building! Here are a few other resources worth checking out:

* [API status](http://status.pc.io/)
* [API reference](https://pc.io/docs/api)
* [How-to guides](https://pc.io/guides)
* [Data modeling guide](https://pc.io/guides/data-modeling-guide/)
* [Slack (public)](http://slack.pc.io/)
