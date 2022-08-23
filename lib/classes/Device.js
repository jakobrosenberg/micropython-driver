import { DeviceUrl } from "./DeviceUri.js";
import { drivers } from "./drivers/drivers.js";

/**
 * @typedef {Object} Options
 * @prop {DeviceUrl|Partial<typeof DeviceUrl['InputOptions']>|string} url
 */

export class Device {
  /**
   *
   * @param {Options} options
   */
  constructor(options) {
    this.options = options;
    this.url = new DeviceUrl(options.url);

    const Driver = drivers[this.url.protocol];
    this.driver = new Driver(this.url);
  }

  get isConnected() {
    return this.driver.isConnected;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.driver.connect();
      this.driver.on("open", resolve);
      this.driver.on("error", reject);
    });
  }

  disconnect() {
    this.driver.disconnect();
  }

  sendData(data) {
    this.driver.write(data);
  }
}
