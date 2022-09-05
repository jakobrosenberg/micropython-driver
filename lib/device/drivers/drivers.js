import { SerialDriver } from "./SerialDriver.js";
import { TelnetDriver } from "./TelnetDriver.js";

/** @type {Object<string, DriverClass>} */
export const drivers = {
  serial: SerialDriver,
  telnet: TelnetDriver,
};
