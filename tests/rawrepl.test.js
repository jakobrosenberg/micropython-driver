import { Device, listDevices } from "../lib/index.js";
import { getException } from "./utils.js";

let devicePath = "";
beforeAll(async () => {
  const devices = await listDevices();
  devicePath = devices[0].path;
});

// const largeScript = "value = " + Array(10000).fill(" 1 ").join("+") + "\nprint('value is')\nprint(value)";
// const largeScript = "value = '" + "".padEnd(10000, "0") + "'\nprint('value is')\nprint(value)";
const largeScript = "value = '" + "".padEnd(100, "0") + "'\nprint('value is')\nprint(value)";

test("rawRepl", async () => {
  const device = new Device({ url: "serial://" + devicePath });
  await device.connect();

  test("can enter rawRepl mode", async () => {
    assert.equal(device.replMode, "unknown");
    await device.enterRawRepl();
    assert.equal(device.replMode, "rawRepl");

    test("can send large script", async () => {
      device.sendData(largeScript + "\x04");
      // device.sendData("print('hello')\x04");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    // test("can run large script", () => {});
    // console.log("large script", largeScript);
    // const result = await device.runScript(largeScript);
  });
});
