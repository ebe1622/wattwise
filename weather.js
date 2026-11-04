
const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";

// Sample cities
export const sampleCities = [
  "Chennai",
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "London",
  "New York",
  "Tokyo"
];

// Convert weather codes into readable descriptions
function getWeatherDescription(code) {
  const descriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Heavy thunderstorm with hail"
  };

  return descriptions[code] || "Unknown weather";
}

// Get city coordinates
async function getCityCoordinates(city) {
  const url = new URL(GEO_URL);

  url.search = new URLSearchParams({
    name: city,
    count: "1",
    language: "en",
    format: "json"
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to search for city");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${city}" not found`);
  }

  return data.results[0];
}

// Fetch weather details
export async function getWeather(city) {
  if (!city || !city.trim()) {
    throw new Error("Please enter a city name");
  }

  try {
    // Step 1: Find city
    const location = await getCityCoordinates(city.trim());

    // Step 2: Build weather API URL
    const params = new URLSearchParams({
      latitude: location.latitude,
      longitude: location.longitude,

      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m"
      ].join(","),

      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "precipitation_sum",
        "sunrise",
        "sunset"
      ].join(","),

      forecast_days: "7",
      timezone: "auto"
    });

    const response = await fetch(`${BASE_URL}?${params}`);

    if (!response.ok) {
      throw new Error("Unable to fetch weather information");
    }

    const data = await response.json();

    // Step 3: Format response
    return {
      location: {
        city: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude
      },

      current: {
        temperature: data.current.temperature_2m,
        feelsLike: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        precipitation: data.current.precipitation,
        isDay: data.current.is_day === 1,
        weatherCode: data.current.weather_code,
        description: getWeatherDescription(
          data.current.weather_code
        )
      },

      forecast: data.daily.time.map((date, index) => ({
        date,
        description: getWeatherDescription(
          data.daily.weather_code[index]
        ),
        maxTemperature: data.daily.temperature_2m_max[index],
        minTemperature: data.daily.temperature_2m_min[index],
        precipitation: data.daily.precipitation_sum[index],
        sunrise: data.daily.sunrise[index],
        sunset: data.daily.sunset[index]
      })),

      units: {
        temperature: data.current_units.temperature_2m,
        humidity: data.current_units.relative_humidity_2m,
        windSpeed: data.current_units.wind_speed_10m
      },

      timezone: data.timezone
    };

  } catch (error) {
    console.error("Weather API Error:", error.message);
    throw error;
  }
}

// Fetch weather for multiple sample cities
export async function getSampleWeather() {
  return Promise.all(
    sampleCities.map(async (city) => {
      try {
        return await getWeather(city);
      } catch (error) {
        return {
          location: { city },
          error: error.message
        };
      }
    })
  );
}

// Example usage
// getWeather("Chennai").then(console.log).catch(console.error);
