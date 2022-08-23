import { SerialPort } from "serialport";
import { Device } from "./classes/Device.js";

export { Device };

export const listDevices = () => SerialPort.list();
