/**
 * @param {import('events').EventEmitter} eventEmitter
 * @param {string} key
 * @param {Buffer | string | RegExp} query
 * @param {number=} length required if query is a RegExp
 */
export const listenForNextEventPattern = (eventEmitter, key, query, length) =>
  new Promise((resolve, reject) => {
    listenForEventPattern(eventEmitter, key, query, length, (unsub) => {
      unsub();
      resolve();
    });
  });

/**
 * @param {import('events').EventEmitter} eventEmitter
 * @param {string} key
 * @param {Buffer | string | RegExp} query
 * @param {number} length required if query is a RegExp
 * @param {(unsub: ()=>void)=>void} callback
 * @returns {()=>void} unsubscribe
 */
export const listenForEventPattern = (eventEmitter, key, query, length, callback) => {
  length = length || query["length"];
  if (!length) throw new Error("Length can't be 0. Query: " + query.toString());
  const matchable = query instanceof RegExp ? query : query.toString();
  let blob = "";

  /** @param {Buffer|string} data */
  const handleData = (data) => {
    blob += data.toString();
    if (blob.match(matchable)) {
      blob = "";
      // provide an unsub method in the callback
      callback(unsub);
    } else blob = blob.substring(blob.length - length);
  };

  eventEmitter.on(key, handleData);

  function unsub() {
    eventEmitter.removeListener(key, handleData);
  }

  return unsub;
};
