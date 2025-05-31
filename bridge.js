const WebSocket = require("ws");
const zmq = require("zeromq");
const fs = require("fs");


let outfile = 'output.json';
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
      let { city: cityname, state: statename } = JSON.parse(msg.toString());
      await send_data(cityname, statename);
      //TODO: figure out how to make the city and state into a object
      // Send to ZMQ server as "city,state"
      const message = `${cityname},${statename}`;

      await zmqSock1.send(message);
      console.log("Sent to ZMQ:", message);

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


function send_data(cityname, statename) {


  let newcityobject = { city: cityname, state: statename };


fs.readFile(outfile, "utf8", (err, data) => {
    let citydata = [];

    if (!err && data) {
      try {
        citydata = JSON.parse(data);
      } catch (parseErr) {
        console.error("Error parsing existing reviews:", parseErr);
      }
    }

    citydata.push(newcityobject);
    

    fs.writeFile(outfile, JSON.stringify(citydata, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error writing to reviews.json:", writeErr);
      }

    console.log("got it to work\n")
    });
  });


}