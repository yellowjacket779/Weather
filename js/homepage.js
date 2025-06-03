const socket = new WebSocket("ws://localhost:6023");
window.addEventListener("load", runClient);
// Called when city input values change
let message_amount = 0;
let current_amount = 0;
const forecasts = [];
let cityNames = [];
let imageid = 0;

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
          renderweather(msg, cityNames[index]);
          console.log(`Longitude for ${cityid}: ${msg.longitude}`);
        });
    }
  }
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
}

async function themain() {
  runClient();
}


function renderweather(forecasts, cityNames) {
  const container = document.getElementById("weatherCardsContainer");
  // Loop through multiple forecasts if needed
    const card = displayweather(forecasts, cityNames); // Pass corresponding city info
    container.appendChild(card);
    showImage(imageid, forecasts.weather_code);
}


function displayweather(forecast, cityNames){
  const cityId = `city${Math.floor(Math.random() * 1000)}`;
  const container = document.createElement("div");
  container.className = "container";
  container.setAttribute("id", `results-${cityId}`);


  const content = document.createElement("div");
  content.className = "content";

  // Condition
  const icon = document.createElement("img");
  icon.className = "icon";
  icon.setAttribute("id", `image-${cityId}`);
  imageid =`image-${cityId}`;

  // Temperature
  const temp = document.createElement("h1");
  temp.className = "Temp";
  temp.innerHTML = `${forecast.current_temperature_2m} <span id="F">&#8457;</span>`;

  // Time
  const time = document.createElement("h1");
  time.className = "Time";
  const timeString = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: forecast.time,
      });
  time.textContent = timeString;

  // Location
  const location = document.createElement("h1");
  location.className = "Location";
  location.innerHTML = firstletter(cityNames.city) + ", " + firstletter(cityNames.state);

  const uvIndex = document.createElement("p");
  uvIndex.className = "UV";
  uvIndex.textContent = `UV ${forecast.uv_index ?? "N/A"}`;

  // Air Quality
  const airQuality = document.createElement("p");
  airQuality.className = "AirQuality";
  airQuality.textContent = `Air Quality: ${forecast.air_quality ?? "N/A"}`;
  airQuality.style.color = getcolorforairquality(forecast.air_quality);
  // Append to content
  content.appendChild(icon);
  content.appendChild(temp);
  content.appendChild(time);
  content.appendChild(location);
  content.appendChild(uvIndex);
  content.appendChild(airQuality);

  // Append content to container
  container.appendChild(content);

  return container;
}

function getcolorforairquality(airQuality){
  if(0<= airQuality && airQuality <=50){
    return "#00e400";
  }
    if(51<= airQuality && airQuality <=100){
      return "#ffff00";
  }
    if(101<= airQuality && airQuality <=150){
      return "#ff7e00";
  }
    if(151<= airQuality && airQuality <=200){
      return "#ff0000";
  }
  if(201<= airQuality && airQuality <=300){
    return "#8f3f97";
  }
    if(301<= airQuality){
      return "#7e0023";
  }
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
  }

  const imgUrl = "images/";
  const img = document.getElementById(elementId);
  img.src = imgUrl + weatherImages[weatherType];
  img.alt = weatherType;
}

function firstletter(str) {
  let newstring = str.toLowerCase();
  return newstring.charAt(0).toUpperCase() + newstring.slice(1);
}