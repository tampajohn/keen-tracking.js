import PCCore from '../core';
import each from '../core/utils/each';
import extend from '../core/utils/extend';
import { queue } from'./utils/queue';
import { setOptOut } from './utils/optOut';
import pkg from '../package.json';

PCCore.helpers = PCCore.helpers || {};
PCCore.prototype.observers = PCCore.observers || {};

// Install internal queue
PCCore.on('client', function(client){
  client.extensions = {
    events: [],
    collections: {}
  };
  
  if (!client.config.respectDoNotTrack) {
    this.doNotTrack = false;
  }

  if (typeof client.config.optOut !== 'undefined') {
    setOptOut(client.config.optOut);
    this.optedOut = client.config.optOut;
  }
  
  client.queue = queue(client.config.queue);
  client.queue.on('flush', function(){
    client.recordDeferredEvents();
  });
});

// Accessors
PCCore.prototype.writeKey = function(str){
  if (!arguments.length) return this.config.writeKey;
  this.config.writeKey = (str ? String(str) : null);
  return this;
};

PCCore.prototype.referrerPolicy = function(str){
  if (!arguments.length) return this.config.referrerPolicy;
  this.config.referrerPolicy = (str ? String(str) : null);
  return this;
};

// DEPRECATED
PCCore.prototype.setGlobalProperties = function(props){
  PCCore.log('This method has been removed. Check out #extendEvents: https://github.com/pc/pc-tracking.js#extend-events');
  return this;
};

PCCore.version = pkg.version;

export default PCCore;
