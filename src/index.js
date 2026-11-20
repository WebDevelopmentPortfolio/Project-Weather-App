import "./styles.css";

import sunnyIcon from "./images/day-sunny-color-icon.png";
import cloudyIcon from "./images/day-cloudy-color-icon.png";
import rainyIcon from "./images/day-cloud-rain-color-icon.png";
import stormIcon from "./images/day-cloud-rain-lightning-color-icon.png";
import tempIconImage from "./images/medium-temperature-icon.png";
import umbrellaIconImage from "./images/umbrella-color-icon.png";

const defaultItems = document.querySelector(".default-items");
const city = document.getElementById("search-city");
const weatherInfoToday = document.querySelector(".weather-info-today");
const forecastLink = document.querySelector(".forecast-link");
const hideForecast = document.querySelector(".hide-forecast");
const forecastsContainer = document.querySelector(".forecasts");

const savedCity = (function() {
    let enteredCity = "";
    
    return {
        saveEnteredCity: function(inputCity) {
            enteredCity = inputCity;
        },
        getCity() {
            return enteredCity;
        }
    }
})();

city.addEventListener("keydown", (event) => {
    const key = event.key;
    if (key === "Enter") {
        event.preventDefault();

        defaultItems.replaceChildren();
        
        savedCity.saveEnteredCity(city.value);
        const enteredCity = savedCity.getCity();
        
        if (!enteredCity) return;
        
        try {
            displayWeatherInfo(enteredCity);

        } catch (error) {
            console.error('Failed to get weather:', error.message);
        }

        city.value = "";

        forecastLink.classList.remove('hidden');
        forecastsContainer.classList.add('hidden');
        forecastsContainer.replaceChildren();
        forecastLink.textContent = "Show Tomorrow's Forecast";
        forecastLink.dataset.index = "0";
    }
});

const getWeather = async (city) => {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=us&include=current&elements=datetime,temp,humidity,feelslike,feelslikemax,windspeed,windgust,precipprob,precip,precipcover,conditions,description,dew`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    const dailyForecasts = data.days.map((day) => {
        return {
            datetime: day.datetime,
            temp: day.temp,
            humidity: day.humidity,
            feelslike: day.feelslike,
            feelslikemax: day.feelslikemax,
            windspeed: day.windspeed,
            windgust: day.windgust,
            precipprob: day.precipprob,
            precip: day.precip,
            precipcover: day.precipcover,
            conditions: day.conditions,
            description: day.description,
            dew: day.dew
        }
    });

    return {
        city: data.resolvedAddress,
        forecast: dailyForecasts,
        getDay(index) {
            return this.forecast[index]
        }
    }
};

function displayWeatherToday(enteredCity, dateToday, tempInF, description, humidity, heatIndex, dewInF, precipprob, precip, precipcover, windspeed, windgust) {
     weatherInfoToday.replaceChildren();

    const weatherNow = document.createElement("div");
    weatherNow.className = "weather-today";

    const city = document.createElement("p");
    city.className = "city";
    city.textContent = enteredCity.toUpperCase();

    const dateNow = document.createElement("p");
    dateNow.className = "date-now";
    dateNow.textContent = formatDate(dateToday);

    const weatherIconContainer = document.createElement("div");
    weatherIconContainer.className = "weather-icon-container";

    const weatherIcon = document.createElement("img");
    weatherIcon.src = weatherIcons(description.toLowerCase());

    weatherIconContainer.append(weatherIcon);

    const temp = document.createElement("p");
    temp.className = "temp";
    const inCelsius = convertFahrenheit(tempInF);
    temp.textContent = `${tempInF}°F / ${inCelsius}°C`;

    const overall = document.createElement("p");
    overall.className = "summary";
    overall.textContent = `${description}`;

    const addtlTempInfo = addtlTempDetails(heatIndex, humidity, dewInF);

    const addtlRainInfo = addtlRainDetails(precipprob, precip, precipcover, windspeed, windgust);

    weatherNow.append(city, dateNow, weatherIconContainer, temp, overall, addtlTempInfo, addtlRainInfo);
    weatherInfoToday.append(weatherNow);
}

async function displayWeatherInfo(enteredCity) {
    const weatherToday = await getWeather(enteredCity);
    const weatherTodayTemp = weatherToday.forecast[0].temp;
    const dateToday = weatherToday.forecast[0].datetime;
    const description = weatherToday.forecast[0].description;
    const humidity = weatherToday.forecast[0].humidity;
    const heatIndex = weatherToday.forecast[0].feelslikemax;
    const dew = weatherToday.forecast[0].dew;
    const chanceOfRain = weatherToday.forecast[0].precipprob;
    const rain = weatherToday.forecast[0].precip;
    const hoursOfRain = weatherToday.forecast[0].precipcover;
    const windSpeed = weatherToday.forecast[0].windspeed;
    const windGust = weatherToday.forecast[0].windgust;
    
    displayWeatherToday(weatherToday.city, dateToday, weatherTodayTemp, description, humidity, heatIndex, dew, chanceOfRain, rain, hoursOfRain, windSpeed, windGust);
    
    console.clear();
    console.log(weatherToday);
    
}

function formatDate(date) {
    const [year, month, day] = date.split('-');
    const formattedDate = `${month}-${day}-${year}`;

    return formattedDate;
}

function convertFahrenheit(temp) {
    const celsisus = (temp - 32) * (5 / 9);
    
    return celsisus.toFixed(1);
}

function weatherIcons(text) {
    if (text.includes('clear') && (!text.includes('cloudy')) && (!text.includes('rain'))) return sunnyIcon;
    if (text.includes('cloudy') && (!text.includes('rain')) && (!text.includes('storm'))) return cloudyIcon;
    if ((text.includes('cloudy') && (text.includes('rain'))) || (text.includes('storm'))) return rainyIcon;
    if (text.includes('rain') && (!text.includes('cloudy'))) return rainyIcon;
    if (text.includes('thunderstorm') || (text.includes('storm'))) return stormIcon;
}

function tempDescription(temp) {
    /*this is in Fahrenheit*/
    if (temp < 32.0) return "It's freezing out.";
    if (temp < 51.0) return "It's cold out.";
    if (temp < 65.0) return "It's chilly / cool.";
    if (temp < 76.0) return "It's a mild / pleasant weather.";
    if (temp < 86.0) return "Weather's warm.";
    if (temp <= 95.0) return "It's hot out there.";
    return "It's scorching, extremely hot out there."
}

function heatIndexDescription(temp, tempInF) {
    /*this is in Celsius*/
    if (temp < 27.0) return tempDescription(tempInF);
    if (temp < 33.0) return "Caution is advised; fatigue possible with prolonged exposure and activity.";
    if (temp < 42.0) return "Extreme caution is advised; heat cramps and heat exhaustion possible.";
    if (temp < 52.0) return "Danger; heat cramps and heat exhaustion likely; heat stroke probable with continued exposure."
    if (temp >= 52.0) return "Extreme danger; heat stroke is imminent.";
    console.log(tempInF);
}

function dewDescription(dew) {
    /*this is in Fahrenheit*/
    if (dew < 55.0) return "dry and crisp";
    if (dew < 65.0) return "comfortable and pleasant with just a hint of moisture";
    if (dew < 70.0) return "muggy";
    if (dew <= 75.0) return "very humid / sticky";
    return "oppressive and steamy";
}

function addtlTempDetails(heatIndex, humidity, dewInF) {
    const addtlTempInfo = document.createElement("div");
    addtlTempInfo.className = "addtl-temp-info";

    const tempIconContainer = document.createElement("div");
    tempIconContainer.className = "temp-icon-container";

    const tempIcon = document.createElement("img");
    tempIcon.src = tempIconImage;

    tempIconContainer.append(tempIcon);

    const addtlTempDetails = document.createElement("p");
    addtlTempDetails.className = "descriptive-details";
    let inCelsius = convertFahrenheit(heatIndex);
    addtlTempDetails.textContent = `Heat index is at ${heatIndex}°F / ${inCelsius}°C. ${heatIndexDescription(inCelsius, heatIndex)}`
    
    const humidityDetails = document.createElement("p");
    humidityDetails.className = "humidity-details";
    inCelsius = convertFahrenheit(dewInF)
    humidityDetails.textContent = `Humidity is at ${humidity.toFixed(1)}% while dew point is at ${dewInF}°F / ${inCelsius}°C, which explains why air feels ${dewDescription(dewInF)}.`;

    addtlTempInfo.append(tempIconContainer, addtlTempDetails, humidityDetails);

    return addtlTempInfo;
}

function rainDescription(precipprob, precip, precipcover, windspeed, windgust) {
    if (precip === 0.00 || precipprob === 0) return "No rain today.";
    if (precip < 0.25) return `There's ${precipprob}% chance of rain. When it does rain, it will be light but ${moreRainInfo(precipcover)}. Wind speed is at ${windspeed} miles per hour with gustiness of ${windgust} miles per hour.`;
    if (precip < 0.80) return `There's ${precipprob}% chance of rain. When it does rain, it will be moderate downpour - ${moreRainInfo(precipcover)}; you may need an umbrella. Wind speed is at ${windspeed} miles per hour with gustiness of ${windgust} miles per hour.`;
    if (precip < 2.00) return `There's ${precipprob}% chance of rain. When it does rain, it will be strong downpour; heavy puddles and low visibility. Wind speed is at ${windspeed} miles per hour with gustiness of ${windgust} miles per hour.`
    if (precip >= 2.00) return `There's ${precipprob}% chance of rain. When it does rain, it will be intense storm-level rain with flooding risk. Wind speed is at ${windspeed} miles per hour with gustiness of ${windgust} miles per hour.`;
}

function moreRainInfo(precipcover) {
    if (precipcover <= 12.50) return "brief, isolated rain showers - quick then clearing";
    if (precipcover <= 25.00) return "intermittent rain showers across several hours of the day";
    if (precipcover < 50.00) return "frequent, recurring rain showers throughout much of the day"; 
    if (precipcover >= 50.00) return "widespread, prolonged rain for much of the day"
}

function addtlRainDetails(precipprob, precip, precipcover, windspeed, windgust) {
    const addtlRainInfo = document.createElement("div");
    addtlRainInfo.className = "addtl-rain-info";

    const rainIconContainer = document.createElement("div");
    rainIconContainer.className = "rain-icon-container";

    const rainIcon = document.createElement("img");
    rainIcon.src = umbrellaIconImage;

    rainIconContainer.append(rainIcon);

    const rainDetails = document.createElement("p");
    rainDetails.className = "rain-description";
    rainDetails.textContent = rainDescription(precipprob, precip, precipcover, windspeed, windgust);

    addtlRainInfo.append(rainIconContainer, rainDetails);

    return addtlRainInfo;
}

const forecasts = (function() {
    const displayEachForecast = [
        {
            text: "Show The Next 2 Days",
            display: () => displayForecast(1),
        },
        {
            text: "Show The Next 3 Days",
            display: () => displayForecast(2),
        },
        {
            text: "Show The Next 4 Days",
            display: () => displayForecast(3),
        },
        {
            text: "Show The Next 5 Days",
            display: () => displayForecast(4),
        },
        {
            text: "Show Tomorrow's Forecast",
            display: () => displayForecast(5),
        }
    ]

    return {
        getLength: function() {
            return displayEachForecast.length
        },
        getLinkText: function(index) {
            return displayEachForecast[index].text
        },
        getForecast: function(index) {
            return displayEachForecast[index].display()
        }
    }
})();

forecastLink.addEventListener('click', async function(event) {
    event.preventDefault();
    forecastsContainer.classList.remove('hidden');
    forecastsContainer.replaceChildren();

    let currentIndex = Number(this.dataset.index);    
    
    forecastLink.textContent = forecasts.getLinkText(currentIndex);
    await forecasts.getForecast(currentIndex);

    const length = forecasts.getLength();
    this.dataset.index = (currentIndex + 1) % length;

    hideForecast.classList.remove('hidden');
});

async function displayForecast(numberOfDays) {
    const city = savedCity.getCity();
    const weather = await getWeather(city);

    for (let i = 1; i <= numberOfDays; i++) {
        const dayContainer = document.createElement("div");
        dayContainer.className = "day-container";

        const forecastDateText = document.createElement("p");
        forecastDateText.className = "forecast-date";
        const forecastDate = weather.forecast[i].datetime;
        forecastDateText.textContent = formatDate(forecastDate);

        const weatherIconContainer = document.createElement("div");
        weatherIconContainer.className = "forecast-icon-container";

        const weatherIcon = document.createElement("img");
        const weatherDescription = weather.forecast[i].description;
        weatherIcon.src = weatherIcons(weatherDescription.toLowerCase());

        weatherIconContainer.append(weatherIcon);

        const forecastTemp = weather.forecast[i].temp;
        const tempText = displayDailyForecastTemp(forecastTemp);

        const forecastDesc = document.createElement("p");
        forecastDesc.className = "forecast-description";
        const summary = weather.forecast[i].conditions;
        forecastDesc.textContent = summary;

        const forecastHeatIndex = weather.forecast[i].feelslikemax
        const heatIndexText = displayDailyForecastHeat(forecastHeatIndex);

        const chanceOfRainText = document.createElement("p");
        chanceOfRainText.className = "chance-of-rain";
        const chanceOfRain = weather.forecast[i].precipprob;
        chanceOfRainText.textContent = `Chance of rain: ${chanceOfRain}%`;

        dayContainer.append(forecastDateText, weatherIconContainer, tempText, forecastDesc, heatIndexText, chanceOfRainText);

        forecastsContainer.append(dayContainer);
    }
}

function displayDailyForecastTemp(weatherTemp) {
    const tempText = document.createElement("p");
    tempText.className = "date-temperature";
    const tempInF = weatherTemp;
    const tempInC = convertFahrenheit(tempInF);
    tempText.textContent = `${tempInF}°F / ${tempInC}°C`;

    return tempText;
}

function displayDailyForecastHeat(heatIndex) {
    let heatIndexSummary = "";
    const heatIndexText = document.createElement("p");
    heatIndexText.className = "heat-index";
    const heatIndexInF = heatIndex;
    const heatIndexInC = convertFahrenheit(heatIndexInF);
    const heatIndexFullDesc = heatIndexDescription(heatIndexInC, heatIndexInF);
    if (heatIndexFullDesc.includes(';') || heatIndexFullDesc.includes('.')) {
        heatIndexSummary = `${heatIndexFullDesc.split(';')[0]}`;
    }
    heatIndexText.textContent = `Heat Index: ${heatIndexInF}°F / ${heatIndexInC}°C. ${heatIndexSummary}`;

    return heatIndexText;
}

hideForecast.addEventListener('click', (event) => {
    event.preventDefault();
    forecastsContainer.classList.add('hidden');
    forecastsContainer.replaceChildren();
    forecastLink.textContent = "Show Tomorrow's Forecast";
    forecastLink.dataset.index = "0";
});

city.value = "";
