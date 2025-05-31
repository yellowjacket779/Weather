const socket = new WebSocket("ws://localhost:6001");

window.addEventListener("load", runClient);
// Called when city input values change
let messageCount = 0;
let cityandstate = 2;
async function runClient() {
  console.log("Server is connecting");

  if (socket.readyState === WebSocket.OPEN) {
    socket.send("request for city");
  }

  // Listen for messages from the server
  socket.onmessage = (event) => {
    messageCount;
    try {
      const data = event.data;

      //   const cityInfo = data.split(",");
      console.log(data);
      const msg = JSON.parse(event.data);
      let longitude = msg.longitude.toString();
      let cityid = "city1";
      displayForecast(cityid, msg.daily);
      console.log(longitude);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  };
}

async function themain() {
  runClient();
}

function displayForecast(cityId, forecastList) {
  showElement("results-" + cityId);

  // Get 5 day forecast map
  const forecastMap = getSummaryForecast(forecastList);
  showElement("forecast"); // unhide the section too
  // Put forecast into the city's table
  let day = 1;
  for (const date in forecastMap) {
    // Only process the first 5 days
    if (day <= 5) {
      const dayForecast = forecastMap[date];
      showMessage(`${cityId}-day${day}-name`, getDayName(dayForecast.timeDate));
      showMessage(
        `${cityId}-day${day}-high`,
        Math.round(dayForecast.highTemp) + "&deg;"
      );
      showMessage(
        `${cityId}-day${day}-low`,
        Math.round(dayForecast.lowTemp) + "&deg;"
      );
      showImage(`${cityId}-day${day}-image`, dayForecast.weatherCode);
      showMessage(`${cityId}-day${day}-precip`, dayForecast.precip + "%");
    }
    day++;
  }
}

// Return a map of objects with high, low, weather properties
function getSummaryForecast(forecastList) {
  // Map for storing high, low, weather
  let forecastArray = new Array();

  // Determine high and low for each day
  let highTemps = forecastList.temperature_2m_max;
  console.log("Highs : ", highTemps);
  let lowTemps = forecastList.temperature_2m_min;
  console.log("Lows : ", lowTemps);
  let weatherCode = forecastList.weather_code;
  console.log("Codes : ", weatherCode);
  let timeDate = forecastList.time;








  
  console.log("Dates : ", timeDate);
  let precip = forecastList.precipitation_probability_max;
  console.log("Dates : ", precip);

  for (let i = 0; i < 7; i++) {
    let forecast = {};
    forecast.highTemp = highTemps[i];
    forecast.lowTemp = lowTemps[i];
    forecast.weatherCode = weatherCode[i];
    forecast.timeDate = timeDate[i];
    forecast.precip = precip[i];
    console.log("forecast : ", i, " index ", forecast);
    forecastArray.push(forecast);
    console.log(" array ", forecastArray);
  }

  forecastArray.forEach((res) => console.log(res));

  return forecastArray;
}

// Convert date string into Mon, Tue, etc.
function getDayName(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
}

// Show the element
function showElement(elementId) {
  document.getElementById(elementId).classList.remove("hidden");
}

// Hide the element
function hideElement(elementId) {
  document.getElementById(elementId).classList.add("hidden");
}

// Display the message in the element
function showMessage(elementId, message) {
  document.getElementById(elementId).innerHTML = message;
}

// Show the weather image that matches the weatherType
function showImage(elementId, weatherCode) {
  // Images for various weather types
  const weatherImages = {
    Clear: "clear-day.svg",
    Clouds: "cloudy-1-day.svg",
    Drizzle: "rainy-2-day.svg",
    Fog: "fog-day.svg",
    Rain: "rainy-1.svg",
    HeavyRain: "rainy-3.svg",
    Snow: "snowy-3.svg",
    Showers: "rainy-2.svg",
    Unknown: "question.svg",
    Thunder: "thunderstorms.svg",
  };
  let weatherType = 0;

  switch (weatherCode) {
    case 0:
    case 1:
    case 2:
      weatherType = "Clear";
      break;
    case 3:
      weatherType = "Clouds";
      break;

    case 51:
    case 53:
    case 55:
      weatherType = "Drizzle";
      break;
    case 61:
      weatherType = "Rain";
      break;
    case 63:
    case 65:
      weatherType = "HeavyRain";
      break;
    case 80:
    case 81:
    case 82:
      weatherType = "Showers";
      break;
    case 85:
    case 71:
    case 73:
    case 75:
      weatherType = "Snow";
      break;
    case 45:
    case 48:
      weatherType = "Fog";
      break;
    case 91:
    case 96:
    case 97:
      weatherType = "Thunder";
      break;
      Default: weatherType = "Unknown";
  }

  const imgUrl = "images/";
  const img = document.getElementById(elementId);
  img.src = imgUrl + weatherImages[weatherType];
  img.alt = weatherType;
}
