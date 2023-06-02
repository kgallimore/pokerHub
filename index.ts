import { SerialPort, ReadlineParser } from "serialport";
// Test Commit
const serialPorts: SerialPort[] = [];
let currentState: { [key: string]: { [key: string]: string } } = {};
SerialPort.list().then((ports) => {
  for (const port of ports) {
    if (port.manufacturer?.toLowerCase().includes("arduino")) {
      const portNum = port.path.match(/\d+/)?.[0] as string;
      console.log("Found Arduino, attaching: " + port.path);
      const newPort = new SerialPort({ path: port.path, baudRate: 9600 });
      newPort.pipe(new ReadlineParser());
      serialPorts.push(newPort);
      currentState[portNum] = {};
      newPort.on("data", (data) => {
        var parsed: string = data.toString() as string;
        if (parsed.includes(":")) {
          parseMessage(parsed.trim(), parseInt(portNum));
        }
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

function parseMessage(message: string, comPort: number) {
  const port = comPort.toString();
  var splitMessage = message.split(":");
  var readerNumber = splitMessage[0].match(/\d+/)?.[0] as string;
  currentState[port] = { [readerNumber]: splitMessage[1] || "" };
  console.log(currentState);
}
