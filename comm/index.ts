import { SerialPort, ReadlineParser } from "serialport";
import { CommPortUpdate, SensorUpdate } from "./../svelte/src/lib/comm";
import { usb } from "usb";
import "dotenv/config";

const serialPorts: {
  [port: string]: { port: SerialPort; numOfSensors: number; timeout: NodeJS.Timeout };
} = {};
let currentState: { [key: string]: { [key: string]: string } } = {};
usb.on("attach", (device) => {
  attachSerialPorts();
});
function attachSerialPorts() {
  SerialPort.list().then((ports) => {
    for (const port of ports) {
      const portNum = port.path.match(/\d+/)?.[0] as string;
      if (
        port.manufacturer?.toLowerCase().includes("arduino") &&
        Object.keys(serialPorts).includes(port.path) === false
      ) {
        console.log("Found Arduino, attaching: " + port.path);
        const newPort = new SerialPort({ path: port.path, baudRate: 9600 });
        newPort.pipe(new ReadlineParser());
        serialPorts[portNum] = {
          port: newPort,
          numOfSensors: 0,
          timeout: setTimeout(() => {
            newPort.write("resync");
          }, 500),
        };
        currentState[portNum] = {};
        newPort.on("data", (data) => {
          if (serialPorts[portNum].numOfSensors === 0) {
            let testIfNum = parseInt(data.toString().trim());
            if (testIfNum.toString() === data.toString().trim()) {
              clearTimeout(serialPorts[portNum].timeout);
              serialPorts[portNum].numOfSensors = testIfNum;
              console.log(`Port ${port.path} has ${testIfNum} sensors`);
              postCommPortUpdate({
                commPort: parseInt(portNum),
                connected: true,
                numberOfSensors: testIfNum,
              });
            } else {
              newPort.write("resync");
            }
          } else {
            var parsed: string = data.toString() as string;
            if (parsed.includes(":")) {
              parseMessage(parsed.trim(), parseInt(portNum));
            }
          }
        });
        newPort.on("error", (err) => {
          console.log(err);
        });
        newPort.on("close", () => {
          postCommPortUpdate({ commPort: parseInt(portNum), connected: false });
          console.log(`Port ${port.path} closed`);
          delete serialPorts[portNum];
        });
      }
    }
  });
}
attachSerialPorts();

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

function parseMessage(message: string, commPort: number) {
  const port = commPort.toString();
  var splitMessage = message.split(":");
  var readerNumber = splitMessage[0].match(/\d+/)?.[0] as string;
  const cardId = splitMessage[1];
  currentState[port] = { [readerNumber]: cardId || "" };
  postSensorUpdate({ commPort, sensor: parseInt(readerNumber), value: cardId });
}

async function postSensorUpdate(data: SensorUpdate) {
  if (serialPorts[data.commPort.toString()].numOfSensors === 0) return;
  fetch("http://127.0.0.1:5173/api/commPorts/sensors", {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY as string,
    },
  })
    .then(async (response) => {
      response.ok
        ? console.log("Posted update")
        : console.log("Unable to post: " + response.statusText, await response.text());
    })
    .catch(function (err) {
      console.log("Unable to post -", err);
    });
}

async function postCommPortUpdate(data: CommPortUpdate) {
  if (serialPorts[data.commPort.toString()].numOfSensors === 0) return;
  fetch("http://127.0.0.1:5173/api/commPorts", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.API_KEY as string,
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      response.ok
        ? console.log("Posted update")
        : console.log("Unable to post: " + response.statusText, await response.text());
    })
    .catch(function (err) {
      console.log("Unable to post -", err);
    });
}
