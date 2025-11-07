const CONFIG = {
    // OpenWeatherMap API
    OPENWEATHER_API_KEY: '',
    OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
    
    // Google Places API
    GOOGLE_API_KEY: '',
    GOOGLE_PLACES_URL: 'https://maps.googleapis.com/maps/api/place',
    
    WEATHER_UNITS: 'metric', // celsius
    LANGUAGE: 'hu'
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}