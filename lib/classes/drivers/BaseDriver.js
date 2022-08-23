import { EventEmitter } from "events";

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
}
