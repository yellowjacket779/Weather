const WebSocket = require("ws");
const zmq = require("zeromq");
const fs = require("fs").promises; // This is crucial!
const path = require("path"); // Helpful for constructing file paths reliably

// Create WebSocket server (for browser)
const wss = new WebSocket.Server({ port: 6001 }, () => {
  console.log("WebSocket server is listening on ws://localhost:6000");
});
let read = 0;
// Create ZeroMQ REQ socket (to talk to backend)
const zmqSock1 = new zmq.Request();
zmqSock1.connect("tcp://localhost:5555");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const zmqSock2 = new zmq.Request();
zmqSock2.connect("tcp://localhost:6002");

let reply2 = [];

async function getlocation(data) {
  const receivedResponses = []; // Array to store all replies from the receiver

  // 3. Loop through each object and send/receive one by one
  for (let i = 0; i < data.length; i++) {
    const zipmessage = `${data[i].city},${data[i].state}`;
    try {
      // Send the request (the current JSON object)
      await zmqSock1.send(zipmessage);
      console.log("waiting");
      await sleep(2000);
      console.log("done waiting");

      // Wait for the reply. The REQ socket automatically waits for one reply for each request.
      const messages = await zmqSock1.receive();
      const receivedReplyString = messages.toString(); // Convert ZMQ Buffer to string
      console.log(`Received raw reply from ZMQ: "${receivedReplyString}"`);

      let [lat, long] = receivedReplyString.split(",");
      let locations = { latitude: lat, longitude: long };
      if (lat && long && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(long))) {
        const locations = {
          latitude: parseFloat(lat),
          longitude: parseFloat(long),
        };
        receivedResponses.push(locations); // Store the parsed location object
        console.log(
          `Parsed location: Latitude: ${locations.latitude}, Longitude: ${locations.longitude}`
        );
      } else {
        console.warn(
          `Warning: Could not parse "lat,long" from reply for object ${
            i + 1
          }. Raw reply: "${receivedReplyString}"`
        );
        receivedResponses.push({
          error: "Failed to parse lat/long from ZMQ reply",
          rawReply: receivedReplyString,
          originalData: data[i],
        });
      }
    } catch (zmqError) {
      console.error(
        `Error during ZMQ communication for object ${i + 1}:`,
        zmqError
      );
      receivedResponses.push({
        error: `ZMQ Communication Error: ${zmqError.message}`,
        originalData: data[i],
      });
      // Decide if you want to continue or break the loop on ZMQ errors
      // For now, it continues, but logs the error.
    }
  }
  return receivedResponses; // This will be an array of location objects or error objects
}
wss.on("connection", (ws) => {
  console.log("Browser connected via WebSocket");

  ws.on("message", async (msg) => {
    try {
      console.log("Received from browser:", msg.toString());
      console.log(msg);

      console.log("\nProcessing data in main function:");
      await sleep(500);
      const msg2 = await michealservice("output.json"); // Await the Promise returned by testing()
      await sleep(500);
      console.log(msg2.length);
      // Convert from Buffer to string
      console.log("Received message:", msg2);
      const response = JSON.stringify(msg2);

      await zmqSock2.send(response);
      console.log("Sent to ZMQ:", response);
      ws.send(msg2.length);
      let i = 0;

      console.log(i + " " + msg2.length);
      reply2 = await zmqSock2.receive();
      console.log(JSON.parse(reply2));

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
async function michealservice(filePath) {
  try {
    const jsonString = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(jsonString);
    console.log("Data loaded successfully inside michealservice function.");
    const locations = await getlocation(data);
    return locations;
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`Error: File not found at ${filePath}`);
    } else if (err instanceof SyntaxError) {
      console.error("Error parsing JSON string:", err);
    } else {
      console.error("Error reading file:", err);
    }
    // Re-throw the error so the caller can handle it
    throw err;
  }
}
