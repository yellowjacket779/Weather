const socket = new WebSocket("ws://localhost:6001");

window.addEventListener("load", runClient);
// Called when city input values change
let message_amount = 0;
let current_amount = 0;
const forecasts = [];
let cityNames = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runClient() {
  current_amount = 0;
  message_count = 0;
  if (socket.readyState === WebSocket.OPEN) {
    await socket.send("request for city");
  } else {
    socket.onopen = () => {
      socket.send("request for city");
    };
  }
}

// Listen for messages from the server
socket.onmessage = (event) => {
  try {
    if (!isNaN(event.data)) {
      message_amount = parseInt(event.data, 10);
      console.log("Expected forecast count:", message_amount);
      numbermessage = 0;
    } else {
      console.log(event);

      const data = JSON.parse(event.data);
      if (data[0].hasOwnProperty("city")) {
        cityNames = data;
      } else {
        //TODO: display multiple cities got it to work with one city
        const forecast = data;
        console.log(`Received forecast ${current_amount + 1}:`, forecast);

        forecast.forEach((msg, index) => {
          const cityid = `city${index + 1}`;
          createAndDisplayForecastTable(msg.daily, cityNames[index]);
          console.log(`Longitude for ${cityid}: ${msg.longitude}`);
        });
      }
    }
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
};

async function themain() {
  runClient();
}
function firstletter(str) {
  let newstring = str.toLowerCase();
  return newstring.charAt(0).toUpperCase() + newstring.slice(1);
}

function createAndDisplayForecastTable(forecastList, info_of_city) {
  // Step 1: Generate a random city ID
  const cityId = `city${Math.floor(Math.random() * 1000)}`;

  // Step 2: Create the table dynamically
  const table = document.createElement("table");
  table.setAttribute("id", `results-${cityId}`);
  table.classList.add("weather-table"); // optional: add a class for styling

  const caption = document.createElement("caption");
  caption.setAttribute("id", `${cityId}-name`);
  caption.innerText =
    firstletter(info_of_city.city) + ", " + firstletter(info_of_city.state); 
  table.appendChild(caption);

  // Helper to create a row
  function createRow(label, suffix, isImage = false) {
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.textContent = label;
    tr.appendChild(th);

    for (let i = 1; i <= 5; i++) {
      const td = document.createElement("td");

      if (isImage) {
        const img = document.createElement("img");
        img.setAttribute("id", `${cityId}-day${i}-${suffix}`);
        td.appendChild(img);
      } else {
        td.setAttribute("id", `${cityId}-day${i}-${suffix}`);
      }

      tr.appendChild(td);
    }

    return tr;
  }

  // Add each row
  table.appendChild(createRow("Day", "name"));
  table.appendChild(createRow("High", "high"));
  table.appendChild(createRow("Low", "low"));
  table.appendChild(createRow("Rain", "precip"));
  table.appendChild(createRow("Outlook", "image", true));

  // Step 3: Append the table to the DOM
  document.body.appendChild(table);

  // Step 4: Call your existing display function
  displayForecast(cityId, forecastList);
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
