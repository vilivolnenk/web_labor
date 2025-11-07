// Keresés kezelése VALÓDI API-kkal
async function handleSearch(e) {
    e.preventDefault();
    
    const formData = getFormData();
    
    if (!validateForm(formData)) {
        return;
    }
    
    showLoading();
    
    try {
        // VALÓDI API hívások az összes úti célhoz
        const results = await searchDestinationsWithAPI(formData);
        displayResults(results);
    } catch (error) {
        console.error('Keresési hiba:', error);
        showError('Hiba történt a keresés során. Kérlek próbáld újra!');
    } finally {
        hideLoading();
    }
}

// Úti célok keresése VALÓDI API-val
async function searchDestinationsWithAPI(criteria) {
    const cityPromises = destinations.map(async (dest) => {
        try {
            // Időjárás lekérése
            const weather = await weatherAPI.getCurrentWeather(dest.name);
            const forecast = await weatherAPI.getForecast(dest.name);
            
            if (!weather || !forecast || forecast.length === 0) {
                return null;
            }

            // Átlag hőmérséklet az előrejelzésből
            const avgTemp = Math.round(
                forecast.reduce((sum, day) => sum + day.avgTemp, 0) / forecast.length
            );
            
            // Átlag napfény
            const avgSunshine = Math.round(
                forecast.reduce((sum, day) => sum + day.sunshine, 0) / forecast.length
            );

            // Szűrés a kritériumok alapján
            if (avgTemp < criteria.minTemp || avgTemp > criteria.maxTemp) {
                return null;
            }
            
            if (criteria.sunny && avgSunshine < 70) {
                return null;
            }
            
            if (criteria.beach && !dest.beach) return null;
            if (criteria.culture && !dest.culture) return null;
            if (criteria.nature && !dest.nature) return null;

            // Frissített adatok
            return {
                ...dest,
                avgTemp: avgTemp,
                sunshine: avgSunshine,
                humidity: weather.humidity,
                realTimeWeather: weather,
                forecastData: forecast
            };
        } catch (error) {
            console.error(`Hiba ${dest.name} lekérésekor:`, error);
            return null;
        }
    });

    // Várjuk meg az összes választ
    const results = await Promise.all(cityPromises);
    
    // Szűrjük ki a null értékeket
    const validResults = results.filter(result => result !== null);
    
    // Pontszámítás
    return calculateScores(validResults, criteria);
}

// Fotók lekérése Google Places API-val (opcionális)
async function loadDestinationPhotos(cityName) {
    try {
        const places = await placesAPI.searchPlaces(cityName);
        
        if (places.length > 0 && places[0].photos.length > 0) {
            return places[0].photos[0]; // Első fotó URL
        }
        
        return null;
    } catch (error) {
        console.error('Fotó lekérési hiba:', error);
        return null;
    }
}