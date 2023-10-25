import { SerialPort, ReadlineParser } from "serialport";
import { CommPortUpdate, SensorUpdate } from "./../svelte/src/lib/comm";
import { usb } from "usb";
import "dotenv/config";

const serialPorts: {
  [port: string]: { port: SerialPort; numOfSensors: number; timeout: NodeJS.Timeout };
} = {};
let currentState: {
  [port: string]: { [sensor: string]: { sendRemoval?: NodeJS.Timeout; value: string }[] };
} = {};
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
        if (serialPorts[portNum]?.port.isOpen) {
          console.log("Port already open, skipping: " + port.path);
          continue;
        }
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
  console.log("Read message: ", splitMessage[1]);
  var cardIds: string[];
  try {
    cardIds = JSON.parse(splitMessage[1]);
  } catch (e) {
    console.log("Invalid JSON");
    return;
  }
  if (
    currentState[port][readerNumber] === undefined ||
    currentState[port][readerNumber].length === 0
  ) {
    // If this is the first time the reader sent a card, set the value and send it
    currentState[port][readerNumber] = [{ value: cardIds[0] }];
    postSensorUpdate({ commPort, sensor: parseInt(readerNumber), value: cardIds });
    return;
  }
  if (!cardIds) {
    // If the reader reports no cards, start a clock to send a removal message
    currentState[port][readerNumber][0].sendRemoval = setTimeout(() => {
      currentState[port][readerNumber] = [{ value: "" }];
      postSensorUpdate({ commPort, sensor: parseInt(readerNumber), value: [""] });
    }, 1000);
    return;
  }
  // If there is already a card value, set the new array and send it
  Object.values(currentState[port]).forEach((reader) => {
    reader.forEach((sensor) => {
      if (sensor.sendRemoval) clearTimeout(sensor.sendRemoval);
    });
  });
  currentState[port] = {
    [readerNumber]: cardIds.map((value) => {
      return { value };
    }),
  };
  postSensorUpdate({ commPort, sensor: parseInt(readerNumber), value: cardIds });
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
        : console.log(
            "Unable to post " + JSON.stringify(data) + ": " + response.statusText,
            await response.text()
          );
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
