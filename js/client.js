const socket = new WebSocket("ws://localhost:5556");
var states = [
  { name: "ALABAMA", abbreviation: "AL" },
  { name: "ALASKA", abbreviation: "AK" },
  { name: "ARIZONA", abbreviation: "AZ" },
  { name: "ARKANSAS", abbreviation: "AR" },
  { name: "CALIFORNIA", abbreviation: "CA" },
  { name: "COLORADO", abbreviation: "CO" },
  { name: "CONNECTICUT", abbreviation: "CT" },
  { name: "DELAWARE", abbreviation: "DE" },
  { name: "FLORIDA", abbreviation: "FL" },
  { name: "GEORGIA", abbreviation: "GA" },
  { name: "GUAM", abbreviation: "GU" },
  { name: "HAWAII", abbreviation: "HI" },
  { name: "IDAHO", abbreviation: "ID" },
  { name: "ILLINOIS", abbreviation: "IL" },
  { name: "INDIANA", abbreviation: "IN" },
  { name: "IOWA", abbreviation: "IA" },
  { name: "KANSAS", abbreviation: "KS" },
  { name: "KENTUCKY", abbreviation: "KY" },
  { name: "LOUISIANA", abbreviation: "LA" },
  { name: "MAINE", abbreviation: "ME" },
  { name: "MARYLAND", abbreviation: "MD" },
  { name: "MASSACHUSETTS", abbreviation: "MA" },
  { name: "MICHIGAN", abbreviation: "MI" },
  { name: "MINNESOTA", abbreviation: "MN" },
  { name: "MISSISSIPPI", abbreviation: "MS" },
  { name: "MISSOURI", abbreviation: "MO" },
  { name: "MONTANA", abbreviation: "MT" },
  { name: "NEBRASKA", abbreviation: "NE" },
  { name: "NEVADA", abbreviation: "NV" },
  { name: "NEW HAMPSHIRE", abbreviation: "NH" },
  { name: "NEW JERSEY", abbreviation: "NJ" },
  { name: "NEW MEXICO", abbreviation: "NM" },
  { name: "NEW YORK", abbreviation: "NY" },
  { name: "NORTH CAROLINA", abbreviation: "NC" },
  { name: "NORTH DAKOTA", abbreviation: "ND" },
  { name: "OHIO", abbreviation: "OH" },
  { name: "OKLAHOMA", abbreviation: "OK" },
  { name: "OREGON", abbreviation: "OR" },
  { name: "PENNSYLVANIA", abbreviation: "PA" },
  { name: "PUERTO RICO", abbreviation: "PR" },
  { name: "RHODE ISLAND", abbreviation: "RI" },
  { name: "SOUTH CAROLINA", abbreviation: "SC" },
  { name: "SOUTH DAKOTA", abbreviation: "SD" },
  { name: "TENNESSEE", abbreviation: "TN" },
  { name: "TEXAS", abbreviation: "TX" },
  { name: "UTAH", abbreviation: "UT" },
  { name: "VERMONT", abbreviation: "VT" },
  { name: "VIRGIN ISLANDS", abbreviation: "VI" },
  { name: "VIRGINIA", abbreviation: "VA" },
  { name: "WASHINGTON", abbreviation: "WA" },
  { name: "WEST VIRGINIA", abbreviation: "WV" },
  { name: "WISCONSIN", abbreviation: "WI" },
  { name: "WYOMING", abbreviation: "WY" },
];

window.addEventListener("DOMContentLoaded", domLoaded);

function domLoaded() {
  document
    .getElementById("compareBtn")
    .addEventListener("click", compareBtnClick);
  document.getElementById("city").addEventListener("input", cityInput);
  for (let i = 0; i < states.length; i++) {
    let select1 = document.getElementById("stateDD1");
    let option1 = document.createElement("OPTION");
    option1.text = states[i].name;
    option1.value = states[i].name;
    select1.appendChild(option1);
  }
}

// Called when city input values change
function cityInput(e) {
  // Extract the text from city input that triggered the callback
  const cityId = e.target.id;
  const city = document.getElementById(cityId).value.trim();

  // Only show error message if no city
}

// Compare button is clicked
function compareBtnClick() {
  // Get user input
  const city = document.getElementById("city").value.trim();
  const state = document.getElementById("stateDD1").value.trim();
  if (city.length > 0) {
    // Fetch forecasts
    runClient(city, state, "city");
  }
}

async function runClient(myCity, myState) {
  console.log("Server is connecting");

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ city: myCity, state: myState }));
  }

  // Listen for messages from the server
  socket.onmessage = (event) => {
    try {
      const data = event.data;
      const cityInfo = data.split(",");
      console.log(data);
      console.log(cityInfo);
      console.log("Weather data from server:", data);
      document.getElementById("name").innerHTML = myCity;
      document.getElementById("temp").innerHTML = cityInfo[0];
      document.getElementById("city_windspeed").innerHTML = cityInfo[1];
      document.getElementById("city_winddir").innerHTML = cityInfo[2];
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  };
}

async function themain() {
  runClient();
}
