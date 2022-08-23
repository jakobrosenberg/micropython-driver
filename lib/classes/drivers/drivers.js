import { BaseDriver } from "./BaseDriver.js";
import { SerialDriver } from "./SerialDriver.js";
import { TelnetDriver } from "./TelnetDriver.js";

/** @type {Object<string, typeof BaseDriver>} */
export const drivers = {
  serial: SerialDriver,
  telnet: TelnetDriver,
};
