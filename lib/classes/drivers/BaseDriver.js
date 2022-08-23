import { EventEmitter } from "events";

/** @implements {DriverProps} */
export class BaseDriver extends EventEmitter {
  /**
   * @param {DeviceUrl} url
   * @param {Object} options
   */
  constructor(url, options) {
    super();
    this.url = url;
    this.options = options;
  }
  connect() {}
  disconnect() {}
  write() {}
}
