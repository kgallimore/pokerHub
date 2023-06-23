import { SerialPort, ReadlineParser } from "serialport";
import { writeFileSync, readFileSync, existsSync } from "fs";

let codeLookup = existsSync("cardCodes.json")
  ? readFileSync("cardCodes.json", "utf8")
  : false;
const serialPorts: SerialPort[] = [];
let cards: { [key: string]: { suit: string; card: string } } = codeLookup
  ? JSON.parse(codeLookup)
  : {};
let availablePlayingCardSuits = ["spades", "hearts", "clubs", "diamonds"];
let availablePlayingCardValues = [
  "ace",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "jack",
  "queen",
  "king",
];
let combos = availablePlayingCardSuits
  .map((suit) => {
    return availablePlayingCardValues.map((value) => {
      return { suit: suit, card: value };
    });
  })
  .flat();
SerialPort.list().then((ports) => {
  for (const port of ports) {
    if (port.manufacturer?.toLowerCase().includes("arduino")) {
      const portNum = port.path.match(/\d+/)?.[0] as string;
      console.log("Found Arduino, attaching: " + port.path);
      const newPort = new SerialPort({ path: port.path, baudRate: 9600 });
      newPort.pipe(new ReadlineParser());
      serialPorts.push(newPort);
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

function parseMessage(message: string, comPort: number) {
  var splitMessage = message.split(":");
  const cardId = splitMessage[1];
  if (cardId) {
    let readCodes = Object.keys(cards);
    if (readCodes.includes(splitMessage[1])) {
      console.log("Card already read");
      return;
    }
    cards[cardId] = combos[readCodes.length];
    const card = cards[cardId];
    console.log(card.card + " of " + card.suit);
  }
}

function exitHandler(exitCode: object) {
  writeFileSync("cardCodes.json", JSON.stringify(cards));
}

process.on("exit", exitHandler.bind({ cleanup: true }));

process.on("SIGINT", exitHandler.bind({ exit: true }));

process.on("SIGINT", function () {
  //graceful shutdown
  process.exit();
});
