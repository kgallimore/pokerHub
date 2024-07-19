import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { usb } from "usb";
import PocketBase from "pocketbase";
import type {
  CommPortsResponse,
  TypedPocketBase,
} from "./../svelte/src/lib/pocketbase-types";
import { createInterface } from "readline";
import eventsource from "eventsource";
// @ts-expect-error Polyfill
global.EventSource = eventsource;
import "dotenv/config";

const adminEmail = process.env.PB_ADMIN_EMAIL;
if (!adminEmail) throw new Error("No admin email provided");
const adminPassword = process.env.PB_ADMIN_PASSWORD;
if (!adminPassword) throw new Error("No admin password provided");

const pb = new PocketBase(
  process.env.PB_URL ?? "http://127.0.0.1:8090"
) as TypedPocketBase;
await pb.admins.authWithPassword(
  adminEmail,
  process.env.PB_ADMIN_PASSWORD as string
);
const commPorts = await pb
  .collection("CommPorts")
  .getFullList<CommPortsResponse>();
const cardLookup = await pb.collection("Cards").getFullList();
await pb
  .collection("CommPorts")
  .subscribe<CommPortsResponse>("*", async (data) => {
    switch (data.action) {
      case "create":
        commPorts.push(data.record);
        break;
      case "update":
        const index = commPorts.findIndex((port) => port.id === data.record.id);
        commPorts[index] = data.record;
        break;
      case "delete":
        commPorts.splice(
          commPorts.findIndex((port) => port.id === data.record.id),
          1
        );
        break;
    }
  });
const serialPorts: {
  [port: string]: {
    port: SerialPort;
    numOfSensors: number;
    timeout: NodeJS.Timeout;
  };
} = {};
const currentState: {
  [port: string]: {
    [sensor: string]: { sendRemoval?: NodeJS.Timeout; value: string }[];
  };
} = {};
usb.on("attach", (device) => {
  console.log("USB device attached:");
  attachSerialPorts();
});
usb.on("detach", (device) => {
  console.log("USB device detached");
});
function attachSerialPorts() {
  SerialPort.list().then((ports) => {
    for (const port of ports.filter(p=> !Object.keys(serialPorts).includes(p.path))) {
      const portNum = port.path.match(/\d+/)?.[0] as string;
      if (
        !["arduino", "espressif"].includes(port.manufacturer?.toLowerCase() ?? "")
      ){
        console.log(`Skipping: ${port.path} as the manufacturer is not expected: ${port.manufacturer}`);
        continue;
      }
      if (serialPorts[portNum]?.port.isOpen) {
        console.log("Port already open, skipping: " + port.path);
        continue;
      }
      console.log("Found micro-controller, attaching: " + port.path);
      const newPort = new SerialPort({ path: port.path, baudRate: 115200 });
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
      newPort.on("close", async () => {
        await postCommPortUpdate({
          commPort: parseInt(portNum),
          connected: false,
        });
        console.log(`Port ${port.path} closed`);
        delete serialPorts[portNum];
      });
    }
  });
}
attachSerialPorts();

if (process.platform === "win32") {
  var rl = createInterface({
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
  var cardIds: string[];
  try {
    cardIds = JSON.parse(splitMessage[1]);
  } catch (e) {
    console.log("Invalid JSON");
    return;
  }
  if (Array.isArray(cardIds) === false) {
    return;
  }
  if (
    currentState[port][readerNumber] === undefined ||
    currentState[port][readerNumber].length === 0
  ) {
    // If this is the first time the reader sent a card, set the value and send it
    currentState[port][readerNumber] = [{ value: cardIds[0] }];
    postSensorUpdate({
      commPort,
      sensor: parseInt(readerNumber),
      value: cardIds,
    });
    return;
  }
  if (!cardIds) {
    // If the reader reports no cards, start a clock to send a removal message
    currentState[port][readerNumber][0].sendRemoval = setTimeout(() => {
      currentState[port][readerNumber] = [{ value: "" }];
      postSensorUpdate({
        commPort,
        sensor: parseInt(readerNumber),
        value: [""],
      });
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
  postSensorUpdate({
    commPort,
    sensor: parseInt(readerNumber),
    value: cardIds,
  });
}

async function postSensorUpdate(data: {
  commPort: number;
  sensor: number;
  value: Array<string>;
}) {
  if (serialPorts[data.commPort.toString()].numOfSensors === 0) return;
  const existingCommPort = commPorts.find(
    (port) => port.port === data.commPort
  );
  if (!existingCommPort) {
    console.warn("Tried to post sensor update to null port");
    return;
  }

  let cardIds = data.value.map((card) => {
    return cardLookup.find((c) => c.uid === card)?.id ?? "";
  });
  console.log(data, existingCommPort.sensors, data.sensor, cardIds);

  await pb
    .collection("Sensors")
    .update(existingCommPort.sensors[data.sensor], { cards: cardIds });
}

async function postCommPortUpdate(data: {
  commPort: number;
  connected: boolean;
  numberOfSensors?: number;
}) {
  const existingCommPort = commPorts.find(
    (port) => port.port === data.commPort
  );
  if (existingCommPort) {
    if (
      data.numberOfSensors &&
      existingCommPort.sensors.length !== data.numberOfSensors
    ) {
      const createdSensors: Array<string> = [];
      for (
        let i = existingCommPort.sensors.length;
        i < data.numberOfSensors;
        i++
      ) {
        createdSensors.push(
          (
            await pb.collection("Sensors").create({
              commPort: existingCommPort.id,
              cards: [],
            })
          ).id
        );
      }
      await pb.collection("CommPorts").update(existingCommPort.id, {
        connected: data.connected,
        sensors: createdSensors,
      });
    } else {
      await pb.collection("CommPorts").update(existingCommPort.id, {
        connected: data.connected,
      });
    }
  } else if (data.numberOfSensors) {
    const newPort = await pb.collection("CommPorts").create({
      port: data.commPort,
      connected: data.connected,
      numberOfSensors: data.numberOfSensors,
    });
    const createdSensors: Array<string> = [];
    for (let i = 0; i < data.numberOfSensors; i++) {
      createdSensors.push(
        (
          await pb.collection("Sensors").create({
            commPort: newPort.id,
            cards: [],
          })
        ).id
      );
    }
    await pb.collection("CommPorts").update(newPort.id, {
      sensors: createdSensors,
    });
  }
}
