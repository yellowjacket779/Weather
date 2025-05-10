//  Hello World server
//  Binds REP socket to tcp://*:5555
//  Expects "Hello" from client, replies with "World"

const zmq = require("zeromq");

async function runServer() {
  const sock = new zmq.Reply();

  await sock.bind("tcp://*:5555");
  const [msg] = await sock.receive();
  console.log(msg.toString());
  const messageStr = msg.toString(); // Convert from Buffer to string
  console.log("Received message:", messageStr);

  const [city, state] = messageStr.split(",");
  console.log("\n");

  getWeatherForecast(city, state, sock);
}

runServer();

// function setting_up{

// }

async function getWeatherForecast(myCity, myState, sock) {
  let lat = 50;
  let lon = 20;
  let city = encodeURI(myCity);
  let state = encodeURI(myState);
  // const unitBtns = document.querySelectorAll('input[name="units"]');
  let unit = "fahrenheit";

  const key = process.env.API_KEY;

  let url_location =
    "https://geocode.maps.co/search?q=" +
    city +
    "/+" +
    state +
    key;
  const responseLoc = await fetch(url_location);
  if (responseLoc.ok) {
    const jsonLocResult = await responseLoc.json();
    console.log("city: ", city, " ", state);
    console.log("Full Json ::", jsonLocResult);
    if (jsonLocResult.length > 0) {
      console.log("Json Lon ::", jsonLocResult[0].lon);
      lon = jsonLocResult[0].lon;
      console.log("Lat :: ", jsonLocResult[0].lat);
      lat = jsonLocResult[0].lat;

      let url =
        "https://api.open-meteo.com/v1/forecast?latitude=" +
        lat +
        "&longitude=" +
        lon +
        "&hourly=temperature_2m&current=temperature_2m,wind_speed_10m,wind_direction_10m&wind_speed_unit=mph&temperature_unit=";
      url = url + unit;
      console.log("URL ", url);
      const response = await fetch(url);
      if (response.ok) {
        const jsonResult = await response.json();
        console.log("Full Json ::", jsonResult);
        console.log("Json Daily ::", jsonResult.current);
        console.log("current elements::", jsonResult.current.temperature_2m);
        const spliting = ",";

        const direction = getDirection(jsonResult.current.wind_direction_10m);

        await sock.send(
          Math.round(jsonResult.current.temperature_2m) +
            "°F" +
            spliting +
            jsonResult.current.wind_speed_10m +
            spliting +
            direction
        );
      }
    }
  }
}
function getDirection(angle) {
  // We divide it into 16 sections
  let directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  // This means, every 360 / 16 degree, there's a section change
  // So, in our case, every 22.5 degree, there's a section change
  // In order to get the correct section, we just need to divide
  let section = parseInt(angle / 22.5 + 0.5);
  // If our result comes to be x.6, which should normally be rounded off to
  // int(x) + 1, but parseInt doesn't care about it
  // Hence, we are adding 0.5 to it

  // Now we know the section, just need to make sure it's under 16
  section = section % 16;

  // Now we can return it
  return directions[section];
}
