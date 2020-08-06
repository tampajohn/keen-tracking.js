import pkg from '../package.json';

export function initAutoTrackingCore(lib) {
  return function (obj) {
    const client = this;

    if (!window.trackingInitialized) {
      window.trackingInitialized = true
      const helpers = lib.helpers;
      const utils = lib.utils;
      const load_id = helpers.getUniqueId();
      const options = utils.extend({
        ignoreDisabledFormFields: false,
        ignoreFormFieldTypes: ['password'],
        recordClicks: true,
        recordClicksPositionPointer: false,
        recordChanges: true,
        recordFormSubmits: false,
        recordPageViews: true,
        recordPageViewsOnExit: false,
        recordScrollState: true,
        shareUuidAcrossDomains: true,
        collectIpAddress: true,
        collectUuid: true,
        recordElementViews: true,
        requestType: 'fetch',
        catchError: undefined // optional, function(someError) - error handler
      }, obj);

      if (client.config.requestType === 'beaconAPI' && options.catchError) {
        throw `You cannot use the BeaconAPI and catchError function in the same time, because BeaconAPI ignores errors. For requests with error handling - use requestType: 'fetch'`;
        return;
      }

      if (
        client.config.requestType === 'jsonp' // jsonp is deprecated, it's the default value from old pc's client
      ) {
        if (options.catchError) {
          client.config.requestType = 'fetch';
        } else {
          client.config.requestType = 'beaconAPI';
        }
      }

      let now = new Date();
      const cookie = new utils.cookie('pc');

      let allTimeOnSiteS = 0;
      let allTimeOnSiteMS = 0;
      if(typeof document !== 'undefined') {
        let hidden;
        let visibilityChange;
        if (typeof document.hidden !== "undefined") {
          hidden = "hidden";
          visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
          hidden = "msHidden";
          visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
          hidden = "webkitHidden";
          visibilityChange = "webkitvisibilitychange";
        }

        const handleVisibilityChange = () => {
          if(document[hidden]) {
            allTimeOnSiteS += getSecondsSinceDate(now);
            allTimeOnSiteMS += getMiliSecondsSinceDate(now);
            return;
          } 
          now = new Date();
        }
        if(typeof document.addEventListener !== "undefined" ||
          hidden !== undefined){
          document.addEventListener(visibilityChange, handleVisibilityChange, false); 
        }
      }

      const domainName = helpers.getDomainName(window.location.hostname);
      const cookieDomain = domainName && options.shareUuidAcrossDomains ? {
        domain: '.' + domainName
      } : {};

      let uuid;
      if (options.collectUuid) {
        uuid = cookie.get('uuid');
        if (!uuid) {
          uuid = helpers.getUniqueId();
          cookie.set('uuid', uuid, cookieDomain);
        }
      }

      let initialReferrer = cookie.get('initialReferrer');
      if (!initialReferrer) {
        initialReferrer = document && document.referrer || undefined;
        cookie.set('initialReferrer', initialReferrer, cookieDomain);
      }

      let initialLandingPage = cookie.get('initialLandingPage');
      if (!initialLandingPage) {
        initialLandingPage = window.location.href;
        cookie.set('initialLandingPage', initialLandingPage, cookieDomain);
      }

      let initialUTM = cookie.get('initialUTM');
      if (!initialUTM) {
        let query = window.location.search.slice(1).toLowerCase();
        let params = helpers.getURLParams(query)
        initialUTM = helpers.getUTMObject(params)
        cookie.set('initialUTM', initialUTM, cookieDomain);
      }

      let latestUTM = cookie.get('latestUTM');
      if (window.location.search.toLowerCase().indexOf('utm_campaign') > -1) {
        let query = window.location.search.slice(1).toLowerCase();
        let params = helpers.getURLParams(query)
        latestUTM = helpers.getUTMObject(params)
        cookie.set('latestUTM', latestUTM, cookieDomain);
      }

      let scrollState = {};
      if (options.recordScrollState) {
        scrollState = helpers.getScrollState();
        utils.listener('window').on('scroll', () => {
          scrollState = helpers.getScrollState(scrollState);
        });
      }

      let dataLayer = window.dataLayer && window.dataLayer.length > 0 ? window.dataLayer[0] : {};
      let { property = null, status = null, pageName = null , ...meta =  {}} = dataLayer;
      client.extendEvents(function () {
        const browserProfile = helpers.getBrowserProfile();
        return {
          tracked_by: pkg.name + '-' + pkg.version,
          local_time_full: new Date().toISOString(),
          user: {
            uuid
          },
          page: {
            load_id: load_id,
            title: document ? document.title : null,
            description: browserProfile.description,
            scroll_state: scrollState,
            site_type: property,
            site_status: status,
            page_name: pageName,
            page_meta: meta,
            time_on_page: allTimeOnSiteS > 0 ? allTimeOnSiteS : getSecondsSinceDate(now),
            time_on_page_ms: allTimeOnSiteMS > 0 ? allTimeOnSiteMS : getMiliSecondsSinceDate(now)
          },
          user_agent: window.navigator.userAgent,
          tech: {
            profile: browserProfile
          },
          pc: window && window.pcBaseObj ? window.pcBaseObj : {},
          url: {
            full: window ? window.location.href : '',
            host: window ? window.location.hostname : '',
            domain: window ? getDomain(window.location.hostname) : '',
            path: window ? window.location.pathname : '',
            qs: window ? window.location.search : '',
          },
          funnel: {
            initial_landing_page: initialLandingPage,
            initial_utm: initialUTM,
            latest_utm: latestUTM,
          },
          referrer: {
            initial: initialReferrer,
            full: document ? document.referrer : '',
          }
        };
      });

      if (options.recordClicks === true) {
        utils.listener('a, a *, button').on('click', function (e) {
          const el = e.target;
          let event = {
            element: helpers.getDomNodeProfile(el),
            local_time_full: new Date().toISOString()
          };

          // pointer position tracking
          if(options.recordClicksPositionPointer === true) {
            const pointer = {
              x_position: e.pageX,
              y_position: e.pageY,
            }
            event = {...event, pointer};
          }

          if (options.catchError) {
            return client
              .recordEvent({
                collection: 'clicks',
                event
              }).catch(err => {
                options.catchError(err);
              });
          }

          return client
            .recordEvent({
              collection: 'clicks',
              event
            });
        });
      }

      if (options.recordChanges === true) {
        utils.listener('*').on('change', function (e) {
          const el = e.target;
          const event = {
            element: helpers.getDomNodeProfile(el),
            local_time_full: new Date().toISOString()
          };

          if (options.catchError) {
            return client
              .recordEvent({
                collection: 'changes',
                event
              }).catch(err => {
                options.catchError(err);
              });
          }
          return client
            .recordEvent({
              collection: 'changes',
              event
            });
        });
      }

      if (options.recordFormSubmits === true) {
        utils.listener('form').on('submit', function (e) {
          const el = e.target;
          const serializerOptions = {
            disabled: options.ignoreDisabledFormFields,
            ignoreTypes: options.ignoreFormFieldTypes
          };
          const event = {
            form: {
              action: el.action,
              fields: utils.serializeForm(el, serializerOptions),
              method: el.method
            },
            element: helpers.getDomNodeProfile(el),
            local_time_full: new Date().toISOString()
          };

          if (options.catchError) {
            return client
              .recordEvent({
                collection: 'form_submissions',
                event
              })
              .catch(err => {
                options.catchError(err);
              });
          }

          return client.recordEvent({
            collection: 'form_submissions',
            event
          });
        });
      }

      if (options.recordPageViews === true && !options.recordPageViewsOnExit && !client.firedPageview) {
        client.firedPageview = true;
        if (options.catchError) {
          client
            .recordEvent({
              collection: 'pageviews'
            })
            .catch(err => {
              options.catchError(err);
            });
        } else {
          client
            .recordEvent({
              collection: 'pageviews'
            });
        }
      }

      if (options.recordPageViewsOnExit && typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => {
          client.config.requestType = 'beaconAPI'; // you can run beforeunload only with beaconAPI
          client.recordEvent({
            collection: 'pageviews'
          });
        });
      }
      
      if(options.recordElementViews === true){
        if(typeof IntersectionObserver !== 'undefined'){
          const elementViewsOptions = {
            threshold: 1.0,
          }
          const elementViewsCallback = (events, observer) => {
            events.forEach(el => {
              if(el.isIntersecting){
                let event = {
                  element: helpers.getDomNodeProfile(el.target),
                  local_time_full: new Date().toISOString()
                }
                if (options.catchError) {
                  return client
                    .recordEvent({
                      collection: 'element_views',
                      event
                    }).catch(err => {
                      options.catchError(err);
                    });
                }
  
                return client
                  .recordEvent({
                    collection: 'element_views',
                    event
                  });
              }
            })
          }
          const observer = new IntersectionObserver(elementViewsCallback, elementViewsOptions);
          const target = document.querySelectorAll('.track-element-view');
          target.forEach(el => {
            observer.observe(el);
          });
          client.observers.IntersectionObserver = observer;
        }
      }
    }   

    return client;
  };
}

function getSecondsSinceDate(date) {
  return Math.round(getMiliSecondsSinceDate(date) / 1000);
}

function getMiliSecondsSinceDate(date) {
  return new Date().getTime() - date.getTime();
}

function getDomain(hostname) {
  var p = hostname.split('.');
  return [p.pop(), p.pop()].reverse().join('.')
}
