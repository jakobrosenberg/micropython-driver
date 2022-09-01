import { EventEmitter } from "events";

/**
 * @typedef {'repl'|'rawRepl'|'rawPasteMode'|'pasteMode'|'rebooting'|'safebooting'|'unknown'} ReplMode
 * @typedef {'receiving'|'executing'|'readingErrors'} RawReplState
 *
 * @typedef {Object} RawDataCollected
 * @prop {string} data
 * @prop {string} error
 * @prop {string} discarded
 * @prop {boolean} completed
 */

/**
 * @typedef {Object} DeviceEvents
 * @prop {(data: Buffer) => void} write
 * @prop {(data: Buffer) => void} data
 * @prop {(data: Error) => void} error
 * @prop {(rawReplState: RawReplState) => void} rawReplState
 * @prop {(replMode: ReplMode) => void} replMode
 * @prop {(obj: RawDataCollected) => void} rawDataCollected
 */

export class DeviceInterface extends EventEmitter {
  /** @type {ReplMode} */
  _replMode;
  /** @type {RawReplState} */
  _rawReplState;
  /** @type {<U extends keyof DeviceEvents>(event: U, listener: DeviceEvents[U])=>any} */
  on;
  /** @type {<U extends keyof DeviceEvents>(event: U, listener: DeviceEvents[U])=>any} */
  once;
  /** @type {<U extends keyof DeviceEvents>(event: U, ...args: Parameters<DeviceEvents[U]>)=>any} */
  emit;
}
