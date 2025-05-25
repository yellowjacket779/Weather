const WebSocket = require("ws");
const zmq = require("zeromq");
const fs = require("fs");
// Create WebSocket server (for browser)
const wss = new WebSocket.Server({ port: 6001 }, () => {
  console.log("WebSocket server is listening on ws://localhost:6000");
});
let read = 0;
// Create ZeroMQ REQ socket (to talk to backend)
const zmqSock1 = new zmq.Request();
zmqSock1.connect("tcp://localhost:5555");

const zmqSock2 = new zmq.Request();
zmqSock2.connect("tcp://localhost:6002");

wss.on("connection", (ws) => {
  console.log("Browser connected via WebSocket");

  ws.on("message", async (msg) => {
    try {
      console.log("Received from browser:", msg.toString());
      console.log(msg);
      const read = fs.readFileSync("output.txt", "utf8");
      console.log(read);
      // let { differentcites } = read;
      let { city, state } = read.split(",");
      // Send to ZMQ server as "city,state"
      // const message = `${city},${state}`;
      console.log(city);
      console.log(state);
      const message = "salem,alabama";

      await zmqSock1.send(message);
      console.log("Sent to ZMQ:", message);
      let send_to_file = message + "\n";
      // Wait for ZMQ reply
      const [msg2] = await zmqSock1.receive();
      console.log(msg2.toString());
      const messageStr = msg2.toString(); // Convert from Buffer to string
      console.log("Received message:", messageStr);

      const [lat, long] = messageStr.split(",");
      const message2 = lat + "," + long;
      await zmqSock2.send(message2);
      console.log("Sent to ZMQ:", message2);

      // Wait for ZMQ reply
      const [reply2] = await zmqSock2.receive();
      console.log("Received from ZMQ:", reply2.toString());

      // Send result back to browser
      ws.send(reply2.toString());
    } catch (err) {
      console.error("Error:", err);
      ws.send("Error processing request.");
    }
  });

  ws.on("close", () => {
    console.log("Browser disconnected");
  });
});

function filecontent() {
  fs.readFile("output.txt", "utf8", (err, data) => {
    if (err) console.error(err);
    console.log(data);
    return data;
  });
}
