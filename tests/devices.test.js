import { listDevices } from "../lib/index.js";

test("can list devices", async () => {
  const devices = await listDevices();
  assert(devices.length > 0);
});
