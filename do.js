import { Telnet } from "telnet-client";

const params = {
  host: "192.168.0.188",
  // port: 23,
  shellPrompt: />>> /, // or negotiationMandatory: false
  timeout: 1500,
  loginPrompt: /Login as/m,
  passwordPrompt: /Password/m,
  username: "micro",
  password: "python",
  debug: true,
  negotiationMandatory: false,
  encoding: "utf8",
};
const adapter = new Telnet();

const connect = async () => {
  await adapter.connect(params);
  // console.log("done");
  adapter.on("data", (data) => console.log("@", data.toString(), data));

  const loginHandler = (data) => {
    if (data.toString().match(/Login as:/)) adapter.write("micro\r\n");
    if (data.toString().match(/Password:/)) adapter.write("python\r\n");
    if (data.toString().match(/\r\n>>> /)) {
      adapter.removeListener("data", loginHandler);
      console.log("Logged in");
    }
  };

  adapter.on("data", loginHandler);
  // adapter.once("data", (data) => {
  //   adapter.write("micro\r\n");
  //   adapter.once("data", () => {
  //     adapter.write("python\r\n");
  //     adapter.once("data", () => {
  //       adapter.write("\r\n");
  //     });
  //   });
  // });
};

connect();
