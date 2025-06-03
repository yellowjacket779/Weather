const socket = new WebSocket("ws://localhost:4444");
const selectedCities = [];
const container = document.getElementById("city_buttons_container");

window.addEventListener("load", runClient);

function runClient() {
  socket.onopen = () => {
    console.log("WebSocket connection established.");
    displayConnectionStatus("Connected to server via WebSocket");
    socket.send("request for city");
  };

  // This check may be too early if the socket is still connecting
  if (socket.readyState === WebSocket.OPEN) {
    socket.send("request");
  }
}

socket.addEventListener("message", (event) => {
  try {
    console.log(event.data);
    const data = JSON.parse(event.data);
    createCityButtons(data);
    console.log("Received forecast data:", data);
  } catch (error) {
    console.error("Error parsing or displaying forecast:", error);
  }
});

// Optional utility function
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createCityButtons(cities) {
  cities.forEach(({ city, state }) => {
    const btn = document.createElement("button");
    btn.textContent = `${city}, ${state}`;
    btn.style.margin = "5px";

    // Style for selected buttons
    btn.classList.add("city-button");

    btn.addEventListener("click", () => {
      const index = selectedCities.findIndex(
        (c) => c.city === city && c.state === state
      );

      if (index === -1) {
        // Not selected yet, add to array
        selectedCities.push({ city, state });
        btn.classList.add("selected");
      } else {
        // Already selected, remove from array
        selectedCities.splice(index, 1);
        btn.classList.remove("selected");
      }

      console.log("Selected cities:", selectedCities);
    });

    container.appendChild(btn);
  });
}

window.addEventListener("DOMContentLoaded", domLoaded);
function domLoaded() {
  document
    .getElementById("Remove_selected_cities")
    .addEventListener("click", compareBtnClick);
}
async function compareBtnClick() {
  let yes = confirm("Are you sure that you want to delete that city?");
  if (yes) {
    console.log("yes");
    socket.send(JSON.stringify(selectedCities));
    console.log(JSON.stringify(selectedCities));
  }
  await sleep(500);
  window.location.reload();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
