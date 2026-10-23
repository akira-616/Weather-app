// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const statusMessage = document.getElementById('status-message');
const loading = document.getElementById('loading');
const weatherDisplay = document.getElementById('weather-display');

// Data display elements
const locationName = document.getElementById('location-name');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const weatherDesc = document.getElementById('weather-desc');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');

// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
const weatherCodeMapping = {
    0: { desc: 'Clear sky', icon: '☀️' },
    1: { desc: 'Mainly clear', icon: '🌤️' },
    2: { desc: 'Partly cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Fog', icon: '🌫️' },
    48: { desc: 'Depositing rime fog', icon: '🌫️' },
    51: { desc: 'Light drizzle', icon: '🌧️' },
    53: { desc: 'Moderate drizzle', icon: '🌧️' },
    55: { desc: 'Dense drizzle', icon: '🌧️' },
    56: { desc: 'Light freezing drizzle', icon: '🌧️❄️' },
    57: { desc: 'Dense freezing drizzle', icon: '🌧️❄️' },
    61: { desc: 'Slight rain', icon: '🌦️' },
    63: { desc: 'Moderate rain', icon: '🌧️' },
    65: { desc: 'Heavy rain', icon: '🌧️' },
    66: { desc: 'Light freezing rain', icon: '🌧️❄️' },
    67: { desc: 'Heavy freezing rain', icon: '🌧️❄️' },
    71: { desc: 'Slight snow fall', icon: '🌨️' },
    73: { desc: 'Moderate snow fall', icon: '❄️' },
    75: { desc: 'Heavy snow fall', icon: '❄️' },
    77: { desc: 'Snow grains', icon: '❄️' },
    80: { desc: 'Slight rain showers', icon: '🌦️' },
    81: { desc: 'Moderate rain showers', icon: '🌧️' },
    82: { desc: 'Violent rain showers', icon: '⛈️' },
    85: { desc: 'Slight snow showers', icon: '🌨️' },
    86: { desc: 'Heavy snow showers', icon: '❄️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' },
    96: { desc: 'Thunderstorm with slight hail', icon: '⛈️' },
    99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' }
};

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    // UI Reset for loading state
    hideError();
    weatherDisplay.classList.add('hidden');
    loading.classList.remove('hidden');
    loading.classList.add('flex');

    try {
        // Step 1: Geocoding - Convert city name to coordinates
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please try again.");
        }

        const location = geoData.results[0];
        const lat = location.latitude;
        const lon = location.longitude;
        const displayName = `${location.name}${location.country ? ', ' + location.country : ''}`;

        // Step 2: Fetch Current Weather using coordinates
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Failed to fetch weather data.");
        }

        const weatherData = await weatherResponse.json();
        updateUI(displayName, weatherData.current);

    } catch (error) {
        showError(error.message);
        weatherDisplay.classList.add('hidden');
    } finally {
        loading.classList.add('hidden');
        loading.classList.remove('flex');
    }
}

function updateUI(locationStr, currentData) {
    // Map weather code to description and icon
    const wmoCode = currentData.weather_code;
    const weatherInfo = weatherCodeMapping[wmoCode] || { desc: 'Unknown condition', icon: '🌡️' };

    // Update DOM Elements
    locationName.textContent = locationStr;
    temperature.textContent = Math.round(currentData.temperature_2m);
    weatherDesc.textContent = weatherInfo.desc;
    weatherIcon.textContent = weatherInfo.icon;
    humidity.textContent = currentData.relative_humidity_2m;
    windSpeed.textContent = currentData.wind_speed_10m;

    // Show weather display
    weatherDisplay.classList.remove('hidden');
    weatherDisplay.classList.add('flex');
}

function showError(message) {
    statusMessage.textContent = message;
    statusMessage.classList.remove('hidden');
}

function hideError() {
    statusMessage.classList.add('hidden');
}

// Optional: Pre-load a default city on startup
window.addEventListener('load', () => {
    cityInput.value = 'New York';
    handleSearch();
});
