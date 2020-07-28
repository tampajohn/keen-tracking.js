import PCCore from './index';
import each from '../core/utils/each';
import extend from '../core/utils/extend';
import { listenerCore } from './utils/listener';
import {
  recordEvent,
  recordEvents
} from './record-events-browser';
import {
  deferEvent,
  deferEvents,
  queueCapacity,
  queueInterval,
  recordDeferredEvents
} from './defer-events';
import { extendEvent, extendEvents } from './extend-events';
import { initAutoTrackingCore } from './browser-auto-tracking';
import { getBrowserProfile } from './helpers/getBrowserProfile';
import { getDatetimeIndex } from './helpers/getDatetimeIndex';
import { getDomainName } from './helpers/getDomainName';
import { getDomNodePath } from './helpers/getDomNodePath';
import { getDomNodeProfile } from './helpers/getDomNodeProfile';
import { getScreenProfile } from './helpers/getScreenProfile';
import { getScrollState } from './helpers/getScrollState';
import { getURLParams } from './helpers/getURLParams';
import { getUniqueId } from './helpers/getUniqueId';
import { getWindowProfile } from './helpers/getWindowProfile';
import { cookie } from './utils/cookie';
import { deepExtend } from './utils/deepExtend';
import { serializeForm } from './utils/serializeForm';
import { timer } from './utils/timer';
import { setOptOut } from './utils/optOut';
import { isLocalStorageAvailable } from './utils/localStorage';

// ------------------------
// Methods
// ------------------------
extend(PCCore.prototype, {
  recordEvent,
  recordEvents
});

extend(PCCore.prototype, {
  deferEvent,
  deferEvents,
  queueCapacity,
  queueInterval,
  recordDeferredEvents,
  setOptOut
});
extend(PCCore.prototype, {
  extendEvent,
  extendEvents
});

// ------------------------
// Auto-Tracking
// ------------------------
const initAutoTracking = initAutoTrackingCore(PCCore);
extend(PCCore.prototype, {
  initAutoTracking
});

// ------------------------
// Helpers
// ------------------------
extend(PCCore.helpers, {
  getBrowserProfile,
  getDatetimeIndex,
  getDomainName,
  getDomNodePath,
  getDomNodeProfile,
  getScreenProfile,
  getScrollState,
  getUniqueId,
  getURLParams,
  getWindowProfile
});

// ------------------------
// Utils
// ------------------------
const listener = listenerCore(PCCore);
extend(PCCore.utils, {
  cookie,
  deepExtend,
  listener,
  serializeForm,
  timer
});

PCCore.listenTo = (listenerHash) => {
  each(listenerHash, (callback, key) => {
    let split = key.split(' ');
    let eventType = split[0],
    selector = split.slice(1, split.length).join(' ');
    // Create an unassigned listener
    return listener(selector).on(eventType, callback);
  });
};

export let pcGlobals = undefined;
if (typeof webpackPCGlobals !== 'undefined') {
  pcGlobals = webpackPCGlobals;
}

if (isLocalStorageAvailable && localStorage.getItem('optout')) {
  PCCore.optedOut = true;
}

if (navigator.doNotTrack === '1'
  || navigator.doNotTrack === 'yes') {
  PCCore.doNotTrack = true;
}

export const PC = PCCore.extendLibrary(PCCore); // deprecated, left for backward compatibility
export const PCTracking = PC;
export default PC;