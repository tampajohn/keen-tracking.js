# Automated Event Tracking (browser-only)

Automatically record pageviews, clicks, form submissions and element_views, with a robust data model.

### Installation

Install this package from NPM *Recommended*

```ssh
npm install pc-tracking --save
```

Or load it from public CDN

```html
<script crossorigin src="https://cdn.jsdelivr.net/npm/pc-tracking@4"></script>
<script>
PCTracking.ready(function(){
  const client = new PCTracking({
    projectId: 'YOUR_PROJECT_ID',
    writeKey: 'YOUR_WRITE_KEY'
  });
  client.initAutoTracking();
});
</script>
```

### Configuration options

The following configuration options are available to let you specify which types of events to track (defaults shown):

```javascript
const client = new PCTracking({
  projectId: 'YOUR_PROJECT_ID',
  writeKey: 'YOUR_WRITE_KEY'
});

client.initAutoTracking({

  // record on page load
  recordPageViews: true,
  // OR
  // record on leaving the page - this ways you will get the time spent on this page
  recordPageViewsOnExit: true,

  recordScrollState: true, // see how far people scrolled

  recordClicks: true, // record clicks on A links
  recordClicksPositionPointer: false, // record pointer position for clicks
  
  // FORMS
  recordFormSubmits: true,
  ignoreDisabledFormFields: false,
  ignoreFormFieldTypes: ['password'],

  // GDPR related options
  collectIpAddress: true, // default
  collectUuid: true, // default

  // share UUID cookies across subdomains
  shareUuidAcrossDomains: false, // default

  // catchError: myCustomErrorHandler

  //Track HTML elements views
  recordElementViews: true // see if an element was seen

});
```

### Request types

We make requests using the [BeaconAPI](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API).
It's the fastest non-invasive way to track user behaviour.
Due its nature, BeaconAPI runs requests in the background, with no possibility  
to handle errors. If you want to handle errors, you need to use the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

```javascript
const client = new PCTracking({
  projectId: 'YOUR_PROJECT_ID',
  writeKey: 'YOUR_WRITE_KEY',
  requestType: 'beaconAPI' // beaconAPI, fetch
});
```

### Error Handling

[Handling connection problems](https://github.com/pc/pc-tracking.js#handling-connection-problems)

```javascript
const client = new PCTracking({
  projectId: 'YOUR_PROJECT_ID',
  writeKey: 'YOUR_WRITE_KEY',
  requestType: 'fetch'
});

function myCustomErrorHandler(someError){
  console.error('Error reported:', someError);
}

client.initAutoTracking({
  recordPageViews: true,
  catchError: myCustomErrorHandler
});
```

### Upgrading from the Web Auto Collector

The interface and behaviors of this feature are a little different, but the data models produced are backward compatible. One notable change is that `clicks` are only recorded for `<a>` tags now. Previously any click any element was recorded. If you would like to specify listeners for other DOM elements, check out the [DOM listener docs](./listeners.md) or the [`.initAutoTracking()` method source](../lib/browser-auto-tracking.js) for insight into how to set up your own listeners. Any additional events recorded from the `client` instance below will use the same robust data models once auto-tracking is enabled.

Scroll state tracking powered by the `getScrollState()` helper and a `window` scroll listener. This scroll listener can be removed by calling `PCTracking.utils.listener('window').off('scroll');`.

### Customization

Add additional properties to any or all events with [`extendEvent` or `extendEvents` methods](./extend-events.md):

```javascript
const client = new PCTracking({
  projectId: 'YOUR_PROJECT_ID',
  writeKey: 'YOUR_WRITE_KEY'
});

client.extendEvents(function(){
  return {
    app: {
      version: '4.1.5'
    },
    user: {
      display_name: 'Johnny 5',
      email_address: 'example@domain.com'
    }
    /* Custom properties for all events */
  };
});

client.extendEvent('pageviews', function(){
  return {
    page: {
      author_id: 'f123109vb1231200312bb',
      author_name: 'John Doe',
      last_updated: '2017-09-13T12:00:00-07:00'
    }
    /* Custom properties for pageviews event */
  };
});

client.initAutoTracking();
```

### Track views of the HTML elements

All HTML elements with a class `.track-element-view` will be observed by the browser. If any of them appears on the screen, an event will be recorded. The event will contain specific attributes from the visible element and nest them in the `element` property.
Note: This feature works only on the [browsers that support Intersection Observer](https://caniuse.com/#search=IntersectionObserver).

```javascript
{

  "element": {
      "title": "Track element view",
      "text": null,
      "class": "track-element-view",
      "event_key": null,
      "node_name": "DIV",
      "href": null,
      "x_position": 8,
      "y_position": 830,
      "selector": "body > div:eq(1)",
      "id": null
    }

}
```


**Want to record custom events?** Any additional events recorded from the `client` instance below will use the same robust data models once auto-tracking is enabled.


### Block bots and improve device recognition

Install [mobile-detect.js](https://github.com/hgoebl/mobile-detect.js) to identify basic device types and block noisy bots and crawlers.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/mobile-detect/1.4.2/mobile-detect.min.js"></script>
<script crossorigin src="https://cdn.jsdelivr.net/npm/pc-tracking@4"></script>
<script>
PC.ready(function(){
  const md = new MobileDetect(window.navigator.userAgent);
  // for Node.js example go https://github.com/hgoebl/mobile-detect.js#nodejs--express
  if (md.is('bot')) {
    return false;
  }

  const client = new PC({
    projectId: 'YOUR_PROJECT_ID',
    writeKey: 'YOUR_WRITE_KEY'
  });

  client.extendEvents(function(){
    return {
      tech: {
        device_type: md.tablet() ? 'tablet' : md.mobile() ? 'mobile' : 'desktop'
      }
      /* Custom properties for all events */
    };
  });

  client.initAutoTracking();
});
</script>
```
