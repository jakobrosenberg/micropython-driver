import { EventEmitter } from "events";

/**
 * @typedef {'repl'|'rawRepl'|'rawPasteMode'|'pasteMode'|'rebooting'|'safebooting'|'unknown'} ReplModes
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
 * @prop {(replMode: ReplModes) => void} replMode
 * @prop {(obj: RawDataCollected) => void} rawDataCollected
 */

export class DeviceInterface extends EventEmitter {
  /** @type {ReplModes} */
  _replMode;
  /** @type {<U extends keyof DeviceEvents>(event: U, listener: DeviceEvents[U])=>any} */
  on;
  /** @type {<U extends keyof DeviceEvents>(event: U, listener: DeviceEvents[U])=>any} */
  once;
  /** @type {<U extends keyof DeviceEvents>(event: U, ...args: Parameters<DeviceEvents[U]>)=>any} */
  emit;
}
