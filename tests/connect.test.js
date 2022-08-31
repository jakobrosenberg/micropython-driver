import { Device, listDevices } from "../lib/index.js";
import { getException } from "./utils.js";

let devicePath = "";
beforeAll(async () => {
  const devices = await listDevices();
  devicePath = devices[0].path;
});

test("device with bad path errors", async () => {
  const exception = getException(() => new Device({ url: "badpath" }));
  assert.equal(exception.message, `Protocol should be 'telnet' or 'serial'. Received 'undefined'`);
});

test("can create device", async () => {
  const device = new Device({ url: "serial://" + devicePath });

  test("can connect to device", async () => {
    const responsePromise = new Promise((resolve) => device.driver.once("data", resolve));
    // device.driver.once("data", (data) => console.log("data", data.toString()));

    await device.connect();
    assert(device.isConnected);

    device.sendData("\x02");
    assert.match((await responsePromise).toString(), /\r\n>>> $/);

    test("can write data to device", async () => {
      device.sendData("\r\n");
      const newLine = await new Promise((resolve) => device.driver.once("data", resolve));
      assert.match(newLine.toString(), /\r\n>>> $/);

      device.sendData('print("hello world")\r\n');
      const printHelloWorld = await new Promise((resolve) => device.driver.once("data", resolve));
      assert.equal(printHelloWorld.toString(), 'print("hello world")\r\nhello world\r\n>>> ');
    });

    test("can run script", () => {});
    // test("discard me", async () => {
    //   device.sendData('print("eat this\\r\\n>>> \\r\\n>>> ")\r\n');
    //   await device.readUntil(">>>");
    //   device.driver.on("data", (data) => console.log(data, data.toString()));
    //   device.sendData("\x01");
    //   await new Promise((resolve) => setTimeout(resolve, 100));
    //   device.sendData("\x05A\x01");
    //   await new Promise((resolve) => setTimeout(resolve, 500));
    // });
    // test("can run script", async () => {
    //   const script = 'greeting = "hello"\nname = "world"\nprint(greeting + name)"';
    // });

    test("can disconnect device", async () => {
      await device.disconnect();
    });
  });
});
