import { SerialPort, ReadlineParser } from "serialport";

const serialPorts: SerialPort[] = [];

SerialPort.list().then((ports) => {
  for (const port of ports) {
    if (port.manufacturer?.toLowerCase().includes("arduino")) {
      console.log("Found Arduino, attaching: " + port.path);
      const newPort = new SerialPort({ path: port.path, baudRate: 9600 });
      newPort.pipe(new ReadlineParser());
      serialPorts.push(newPort);
      newPort.on("data", (data) => {
        console.log(data.toString());
      });
      newPort.on("error", (err) => {
        console.log(err);
      });
      newPort.on("close", () => {
        console.log(`Port ${port.path} closed`);
      });
    }
  }
});
if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("SIGINT", function () {
    process.emit("SIGINT");
  });
}

process.on("SIGINT", function () {
  //graceful shutdown
  process.exit();
});
