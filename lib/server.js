import PCCore from './index';
import extend from '../core/utils/extend';
import {
  recordEvent,
  recordEvents
} from './record-events-server';
import {
  deferEvent,
  deferEvents,
  queueCapacity,
  queueInterval,
  recordDeferredEvents
} from './defer-events';
import { extendEvent, extendEvents } from './extend-events';
import { getDatetimeIndex } from './helpers/getDatetimeIndex';
import { getUniqueId } from './helpers/getUniqueId';
import { deepExtend } from './utils/deepExtend';
import { timer } from './utils/timer';

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
  recordDeferredEvents
});
extend(PCCore.prototype, {
  extendEvent,
  extendEvents
});

// ------------------------
// Helpers
// ------------------------
extend(PCCore.helpers, {
  getDatetimeIndex,
  getUniqueId
});

// ------------------------
// Utils
// ------------------------
extend(PCCore.utils, {
  deepExtend,
  timer
});

export const PC = PCCore; // deprecated, left for backward compatibility
export const PCTracking = PCCore;
module.exports = PC;
