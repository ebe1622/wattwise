
import { getWeather, getSampleWeather } from "./weather.js";

// Fetch weather for a specific city
async function fetchCityWeather() {
  try {
    const result = await getWeather("Chennai");

    console.log("Location:", result.location);
    console.log("Current Weather:", result.current);
    console.log("7-Day Forecast:", result.forecast);

  } catch (error) {
    console.error(error.message);
  }
}

fetchCityWeather();

// To fetch all sample cities:
// getSampleWeather().then(console.table);
