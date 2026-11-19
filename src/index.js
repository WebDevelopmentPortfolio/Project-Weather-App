import "./styles.css";

import sunnyIcon from "./images/day-sunny-color-icon.png";
import cloudyIcon from "./images/day-cloudy-color-icon.png";
import rainyIcon from "./images/day-cloud-rain-color-icon.png";
import stormIcon from "./images/day-cloud-rain-lightning-color-icon.png";
import tempIconImage from "./images/medium-temperature-icon.png";
import umbrellaIconImage from "./images/umbrella-color-icon.png";

const city = document.getElementById("search-city");
const weatherInfo = document.querySelector(".weather-info");

city.addEventListener("keydown", async (event) => {
    const key = event.key;
    if (key === "Enter") {
        event.preventDefault();
        
        const enteredCity = city.value;

        if (!enteredCity) return;

        try {
            const weatherToday = await getWeather(enteredCity);
            const weatherTodayTemp = weatherToday.forecast[0].temp;
            const dateToday = weatherToday.forecast[0].datetime;
            const description = weatherToday.forecast[0].description;
            const humidity = weatherToday.forecast[0].humidity;
            const heatIndex = weatherToday.forecast[0].feelslikemax;
            const dew = weatherToday.forecast[0].dew;
            const chanceOfRain = weatherToday.forecast[0].precipprob;
            const rain = weatherToday.forecast[0].precip;
            
            displayWeatherToday(weatherToday.city, dateToday, weatherTodayTemp, description, humidity, heatIndex, dew, chanceOfRain, rain);
            
            console.clear();
            console.log(weatherToday);

        } catch (error) {
            console.error('Failed to get weather:', error.message);
        }
    
        city.value = "";
        
    }
});

const getWeather = async (city) => {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=us&include=current&elements=datetime,temp,humidity,feelslike,feelslikemax,windspeed,precipprob,precip,precipcover,description,dew`;
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
            precipprob: day.precipprob,
            precip: day.precip,
            precipcover: day.precipcover,
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

function displayWeatherToday(enteredCity, dateToday, tempInF, description, humidity, heatIndex, dewInF, precipprob, precip) {
    weatherInfo.replaceChildren();

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

    const addtlTempInfo = addtlTempDetails(tempInF, heatIndex, humidity, dewInF);

    const addtlRainInfo = document.createElement("div");
    addtlRainInfo.className = "addtl-rain-info";

    const rainIconContainer = document.createElement("div");
    rainIconContainer.className = "rain-icon-container";

    const rainIcon = document.createElement("img");
    rainIcon.src = umbrellaIconImage;

    rainIconContainer.append(rainIcon);

    const rainDetails = document.createElement("p");
    rainDetails.className = "rain-description";
    rainDetails.textContent = rainDescription(precipprob, precip);

    addtlRainInfo.append(rainIconContainer, rainDetails);

    weatherNow.append(city, dateNow, weatherIconContainer, temp, overall, addtlTempInfo, addtlRainInfo);
    weatherInfo.append(weatherNow);
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
    if (text.includes('clear')) return sunnyIcon;
    if (text.includes('cloudy') && (!text.includes('rain'))) return cloudyIcon;
    if (text.includes('cloudy') && (text.includes('rain'))) return rainyIcon;
    if (text.includes('rain') && (!text.includes('cloudy'))) return rainyIcon;
    if (text.includes('thunderstorm') || (test.includes('storm'))) return stormIcon;
}

function tempDescription(temp) {
    /*this is in Fahrenheit*/
    if (temp < 32) return "It's freezing out. Bundle up";
    if (temp < 51) return "It's cold out";
    if (temp < 65) return "It's chilly / cool";
    if (temp < 76) return "It's a mild / pleasant weather";
    if (temp < 86) return "Weather's warm";
    if (temp <= 95) return "It's hot out there";
    return "It's scorching, extremely hot out there"
}

function heatIndexDescription(temp) {
    /*this is in Celsius*/
    if (temp < 27) return "This is not hazardous";
    if (temp < 33) return "Caution is advised; fatigue possible with prolonged exposure and activity";
    if (temp < 42) return "Extreme caution is advised; heat cramps and heat exhaustion possible";
    if (temp < 52) return "Danger; heat cramps and heat exhaustion likely; heat stroke probable with continued exposure"
    if (temp >= 52) return "Extreme danger; heat stroke is imminent";
}

function dewDescription(dew) {
    /*this is in Fahrenheit*/
    if (dew < 55) return "dry and crisp";
    if (dew < 65) return "comfortable and pleasant with just a hint of moisture";
    if (dew < 70) return "muggy";
    if (dew <= 75) return "very humid / sticky";
    return "oppressive and steamy";
}

function addtlTempDetails(tempInF, heatIndex, humidity, dewInF) {
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
    addtlTempDetails.textContent = `${tempDescription(tempInF)}. Heat index is at ${heatIndex}°F / ${inCelsius}°C. ${heatIndexDescription(inCelsius)}.`
    
    const humidityDetails = document.createElement("p");
    humidityDetails.className = "humidity-details";
    inCelsius = convertFahrenheit(dewInF)
    humidityDetails.textContent = `Humidity is at ${humidity.toFixed(1)}% while dew point is at ${dewInF}°F / ${inCelsius}°C, which explains why air feels ${dewDescription(dewInF)}.`;

    addtlTempInfo.append(tempIconContainer, addtlTempDetails, humidityDetails);

    return addtlTempInfo;
}

function rainDescription(precipprob, precip) {
    if (precip === 0.00 || precipprob === 0) return "No rain today.";
    if (precip < 0.25) return `There's ${precipprob}% chance of rain. When it does rain, it will be light sprinkle or passing shower.`;
    if (precip < 0.80) return `There's ${precipprob}% chance of rain. When it does rain, it will be moderate rain; you may need an umbrella.`;
    if (precip < 2.00) return `There's ${precipprob}% chance of rain. When it does rain, it will be strong downpour; heavy puddles and low visibility.`
    if (precip >= 2.00) return `There's ${precipprob}% chance of rain. When it does rain, it will be intense storm-level rain with flooding risk.`;
}

city.value = "";
