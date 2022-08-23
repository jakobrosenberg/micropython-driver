// import { Device, listDevices } from "../lib/index.js";
// import { getException } from "./utils.js";

// const devicePath = "/192.168.0.188";

// test("can create device", async () => {
//   const device = new Device({ url: "telnet://" + devicePath });

//   test("can connect to device", async () => {
//     // const responsePromise = new Promise((resolve) => device.driver.once("data", resolve));
//     // device.driver.once("data", (data) => console.log("data", data.toString()));

//     await device.connect();

//     assert(device.isConnected);
//     // assert.equal((await responsePromise).toString(), "\r\n>>> ");
//   });

//   // test("can write data to device", async () => {
//   //   device.sendData("\r\n");
//   //   const newLine = await new Promise((resolve) => device.driver.once("data", resolve));
//   //   assert.equal(newLine.toString(), "\r\n>>> ");

//   //   device.sendData('print("hello world")\r\n');
//   //   const printHelloWorld = await new Promise((resolve) => device.driver.once("data", resolve));
//   //   assert.equal(printHelloWorld.toString(), 'print("hello world")\r\nhello world\r\n>>> ');
//   // });

//   // test("can disconnect device", async () => {
//   //   await device.disconnect();
//   // });
// });
