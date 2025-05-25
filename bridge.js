const WebSocket = require("ws");
const zmq = require("zeromq");
const fs = require("fs");
// Create WebSocket server (for browser)
const wss = new WebSocket.Server({ port: 5556 }, () => {
  console.log("WebSocket server is listening on ws://localhost:5556");
});

// Create ZeroMQ REQ socket (to talk to backend)
const zmqSock1 = new zmq.Request();
zmqSock1.connect("tcp://localhost:5555");

const zmqSock2 = new zmq.Request();
zmqSock2.connect("tcp://localhost:5557");

wss.on("connection", (ws) => {
  console.log("Browser connected via WebSocket");

  ws.on("message", async (msg) => {
    try {
      console.log("Received from browser:", msg.toString());

      // Expecting city and state as JSON string, e.g. '{"city":"Dallas","state":"TX"}'
      let { city, state } = JSON.parse(msg.toString());

      // Send to ZMQ server as "city,state"
      const message = `${city},${state}`;
      await zmqSock1.send(message);
      console.log("Sent to ZMQ:", message);
      let send_to_file = message + "\n";
      fs.appendFile("output.txt", send_to_file, (err) => {
        if (err) console.error(err);
      });
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
