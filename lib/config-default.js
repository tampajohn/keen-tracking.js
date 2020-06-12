export const configDefault = {

  // defer events - queue
  // https://github.com/pc/pc-tracking.js/blob/master/docs/defer-events.md
  queue: {
    capacity: 5000,
    interval: 15,
  },

  // connection problems - retry request
  retry: {
    limit: 0,
    initialDelay: 200,
    retryOnResponseStatuses: [
      408,
      500,
      502,
      503,
      504
    ]
  },

  unique: true, // record only unique events?
  // if so - store unique events hashes to compare
  cache: {
    /*
      storage: 'indexeddb', // uncomment for persistence
    */
    dbName: 'pcTracking', // indexedDB name
    dbCollectionName: 'events',
    dbCollectionKey: 'hash',

    /*
      hashingMethod: 'md5', // if undefined - store as stringified JSON
    */
    maxAge: 60 * 1000, // store for 1 minute
  }
}

export default configDefault;
