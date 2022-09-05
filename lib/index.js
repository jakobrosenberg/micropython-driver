import { SerialPort } from "serialport";
import { Device } from "./device/Device.js";

export { Device };

export const listDevices = () => SerialPort.list();
