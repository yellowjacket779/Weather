//  Hello World client
var fs = require("fs");
const zmq = require('zeromq');

async function runClient() {
  console.log('Server is connecting');

  //  Socket to talk to server
  const sock = new zmq.Request();
  sock.connect('tcp://localhost:5555');
    await sock.send('salem,oregon');
    checking(sock);
    }

async function checking(sock){ 
  const [result] = await sock.receive();
  console.log('Received\n', result.toString());
  console.log('\n');

  }

async function themain(){
  runClient();
}

themain();