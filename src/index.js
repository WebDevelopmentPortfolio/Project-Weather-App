import "./styles.css";

import sunnyIcon from "./images/day-sunny-color-icon.png";
import cloudyIcon from "./images/day-cloudy-color-icon.png";
import rainyIcon from "./images/day-cloud-rain-color-icon.png";
import stormIcon from "./images/day-cloud-rain-lightning-color-icon.png";
import tempIconImage from "./images/medium-temperature-icon.png";
import umbrellaIconImage from "./images/umbrella-color-icon.png";
import snowHatIcon from "./images/christmas-santa-cap-color-icon.png";
import windIcon from "./images/windmill.png";

const defaultItems = document.querySelector(".default-items");
const formSearch = document.getElementById("search");
const city = document.getElementById("search-city");
const weatherInfoToday = document.querySelector(".weather-info-today");
const selectForecast = document.querySelector(".select-forecasts-container");
const showForecast = document.getElementById("show-forecast");
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

formSearch.addEventListener('submit', async function(event) {
    event.preventDefault();

    defaultItems.replaceChildren();
        
    savedCity.saveEnteredCity(city.value);
    const enteredCity = savedCity.getCity();
    
    if (!enteredCity) return;
    
    try {
        await displayWeatherInfo(enteredCity);
    } catch (error) {
        selectForecast.classList.add('hidden'); /*not working*/
        console.error('Failed to get weather:', error.message);
    }

    city.value = "";

    forecastsContainer.classList.add('hidden');
    forecastsContainer.replaceChildren();
    hideForecast.classList.add('hidden');
    selectForecast.classList.remove('hidden');
    showForecast.value = "";

});

const getWeatherToday = async (city) => {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}/today?unitGroup=us&include=day&elements=datetime,temp,humidity,feelslikemax,windspeed,windgust,precipprob,precip,precipcover,conditions,description,dew,preciptype,snow,snowdepth`;
    const response = await fetch(url);

    if (!response.ok) {
        weatherInfoToday.replaceChildren();
        selectForecast.classList.add('hidden'); /*not working*/
        /*throw new Error(`Weather API error: ${response.status}`);*/ /*I don't want users to see any error thrown by API*/
        return; /*without this, it still returns an error*/
    }

    const data = await response.json();

    const dailyForecasts = data.days.map((day) => {
        return {
            datetime: day.datetime,
            temp: day.temp,
            humidity: day.humidity,
            feelslikemax: day.feelslikemax,
            windspeed: day.windspeed,
            windgust: day.windgust,
            precipprob: day.precipprob,
            precip: day.precip,
            precipcover: day.precipcover,
            conditions: day.conditions,
            description: day.description,
            dew: day.dew,
            preciptype: day.preciptype,
            snow: day.snow,
            snowdepth: day.snowdepth
        }
    });

    return {
        city: data.resolvedAddress,
        forecast: dailyForecasts,
    }
};

function displayWeatherToday(enteredCity, dateToday, tempInF, description, humidity, heatIndex, dewInF, preciptype, precipprob, precip, precipcover, snow, snowdepth, windspeed, windgust) {
    weatherInfoToday.replaceChildren();

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

    const addtlRainInfo = addtlRainDetails(preciptype, precipprob, precip, precipcover);

    const snowInfo = showSnowDetails(preciptype, precipprob, snow, snowdepth);

    const windInfo = showWindDescription(tempInF, windspeed, windgust);

    weatherInfoToday.append(city, dateNow, weatherIconContainer, temp, overall, addtlTempInfo, addtlRainInfo, snowInfo, windInfo);
}

async function displayWeatherInfo(enteredCity) {
    const weatherToday = await getWeatherToday(enteredCity);
    
    if (!weatherToday) {
        selectForecast.classList.add('hidden'); /*not working*/
        return; /*I don't want users to see any error thrown by API*/
    }

    const weatherTodayTemp = weatherToday.forecast[0].temp;
    const dateToday = weatherToday.forecast[0].datetime;
    const description = weatherToday.forecast[0].description;
    const humidity = weatherToday.forecast[0].humidity;
    const heatIndex = weatherToday.forecast[0].feelslikemax;
    const dew = weatherToday.forecast[0].dew;
    const preciptype = weatherToday.forecast[0].preciptype;
    const chanceOfRain = weatherToday.forecast[0].precipprob;
    const rain = weatherToday.forecast[0].precip;
    const hoursOfRain = weatherToday.forecast[0].precipcover;
    const snow = weatherToday.forecast[0].snow;
    const snowdepth = weatherToday.forecast[0].snowdepth;
    const windspeed = weatherToday.forecast[0].windspeed;
    const windgust = weatherToday.forecast[0].windgust;
    
    displayWeatherToday(weatherToday.city, dateToday, weatherTodayTemp, description, humidity, heatIndex, dew, preciptype, chanceOfRain, rain, hoursOfRain, snow, snowdepth, windspeed, windgust);
    
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
    if (text.includes('cloudy') && text.includes('rain') && (!text.includes('storm'))) return rainyIcon;
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

function completeRainDescription(preciptype, precipprob, precip, precipcover) {
    const precipType = preciptype || [];
    let rainDetails = rainDescription('Chance of rain', precipprob, precip, precipcover);
    if (precip === 0.00 || precipprob === 0) return "No rain today.";
    if (precipType.length === 1 && preciptype.includes('rain')) {
        return rainDetails;
    }

    if (precipType.length > 0 && (preciptype.includes('rain') && preciptype.includes('snow'))) {
        rainDetails = rainDescription('Chance of rain/snow', precipprob, precip, precipcover);
        return rainDetails;
    }

    if (precipType.length > 0 && (precipType.includes('rain') && precipType.includes('freezingrain'))) {
        const rainCondition = rainDetails;
        const hasIceHazard = "⚠️ Caution: Sleet.";
        const completeRainCondition = `${rainCondition} ${hasIceHazard}`;
        return completeRainCondition;
    }
}

function rainDescription(chanceOfText, precipprob, precip, precipcover) {
    if (precip < 0.25) return `${chanceOfText}: ${precipprob}%. Light but ${moreRainInfo(precipcover)}.`;
    if (precip < 0.80) return `${chanceOfText}: ${precipprob}%. Moderate downpour - ${moreRainInfo(precipcover)}; you may need an umbrella.`;
    if (precip < 2.00) return `${chanceOfText}: ${precipprob}%. Strong downpour; heavy puddles and low visibility.`;
    if (precip >= 2.00) return `${chanceOfText}: ${precipprob}%. Intense storm-level rain with flooding risk.`;
}

function moreRainInfo(precipcover) {
    if (precipcover <= 12.50) return "brief, isolated rain showers - quick then clearing";
    if (precipcover <= 25.00) return "intermittent rain showers across several hours of the day";
    if (precipcover < 50.00) return "frequent, recurring rain showers throughout much of the day"; 
    if (precipcover >= 50.00) return "widespread, prolonged rain for much of the day"
}

function addtlRainDetails(preciptype, precipprob, precip, precipcover) {
    const addtlRainInfo = document.createElement("div");
    addtlRainInfo.className = "addtl-rain-info";

    const rainIconContainer = document.createElement("div");
    rainIconContainer.className = "rain-icon-container";

    const rainDetails = document.createElement("p");
    rainDetails.className = "rain-description";
    rainDetails.textContent = completeRainDescription(preciptype, precipprob, precip, precipcover);

    if (rainDetails.textContent !== "") {
        const rainIcon = document.createElement("img");
        rainIcon.src = umbrellaIconImage;

        rainIconContainer.append(rainIcon);
    } 
    
    addtlRainInfo.append(rainIconContainer, rainDetails);

    return addtlRainInfo;
}

function snowDescription(preciptype, precipprob, snow, snowdepth) {
    const precipType = preciptype || [];
    
    let snowCondition = `Chance of snow: ${precipprob}%. ${moreSnowInfo(snow)} Snow accumulation on ground: ${snowdepth} inches.`;
    if (precipType.length === 1 && precipType.includes('snow')) {
        return snowCondition;
    }

    if (precipType.length > 0 && (precipType.includes('rain') && precipType.includes('snow'))) {
        snowCondition = `${moreSnowInfo(snow)} Snow accumulation on ground: ${snowdepth} inches.`;
        return snowCondition;
    }

    if (precipType.length > 0 && (precipType.includes('snow') && precipType.includes('ice'))) {
        const hasIceHazard = "⚠️ Caution: Icy conditions.";
        const completeSnowCondition = `${snowCondition} ${hasIceHazard}`;
        return completeSnowCondition;
    }

    if (snow < 0.1 && snowdepth >= 1.0) {
        snowCondition = `Depth of snow on ground: ${snowdepth} inches due to lingering snowpack.`;
        return snowCondition;
    }
}

function moreSnowInfo(snow) {
    if (snow >= 0.1 && snow < 0.5) return `Flurries / trace snow, light dusting on grass and rooftops.`;
    if (snow < 2.0) return `Light snow.`;
    if (snow < 4.0) return `Proceed with caution, a noticeable accumulation on roads.`;
    if (snow < 8.0) return `Alarming / Heavy.`
    if (snow >= 8.0) return `Severe / Major storm.`
}

function showSnowDetails(preciptype, precipprob, snow, snowdepth) {
    const snowDetails = document.createElement("div");
    snowDetails.className = "snow-details";

    const snowIconContainer = document.createElement("div");
    snowIconContainer.className = "snow-icon-container";

    const snowDetailsDescription = document.createElement("p");
    snowDetailsDescription.className = "snow-details-description";

    snowDetailsDescription.textContent = snowDescription(preciptype, precipprob, snow, snowdepth);

    if (snowDetailsDescription.textContent !== "") {
        const snowIcon = document.createElement("img");
        snowIcon.src = snowHatIcon;

        snowIconContainer.append(snowIcon);
    }

    snowDetails.append(snowIconContainer, snowDetailsDescription);

    return snowDetails;
}

function windGustTropicalClime(windgust) {
    /*this is in mph*/
    if (windgust < 25) return 'Normal gust.';
    if (windgust < 39) return 'Proceed with caution; noticeable crosswinds.';
    if (windgust < 58) return 'Alarming / High Alert ⚠️ Driving can be hazardous.';
    if (windgust >= 58) return 'Severe / Dangerous ⚠️';
}

function windGustCoolClime(windgust) {
    /*this is in mph*/
    if (windgust < 13) return 'This means, wind is crisp and brisk.';
    if (windgust < 25) return 'This means, wind is chilly and drafty; you will want a wind-resistant jacket.';
    if (windgust >= 25) return 'This means, wind is raw and blustery.';
}

function windGustColdClime(windgust) {
    /*this is in mph*/
    if (windgust < 11) return 'This means, wind is still and crisp (manageable cold).';
    if (windgust < 21) return 'This means, wind is biting / chilly.';
    if (windgust < 31) return 'This means, wind is piercing / bitter.';
    if (windgust >= 31) return 'Alarming / Dangerous ⚠️';
}

function windGustDescription(temp, windspeed, windgust) {
    const windspeedkmh = windspeed * 1.60934;
    const windgustkmh = windgust * 1.60934;
    const windNumbersDescription = `Wind speed is at ${windspeed} mph / ${windspeedkmh.toFixed(1)} kmh with gustiness of ${windgust} mph / ${windgustkmh.toFixed(1)} kmh.`;
    if (temp > 50) {
        const windDescription = windGustTropicalClime(windgust);
        return `${windNumbersDescription} ${windDescription}`;
    }

    if (temp <= 50) {
        const windDescription = windGustCoolClime(windgust);
        return `${windNumbersDescription} ${windDescription}`;
    }

    if (temp <= 32) {
        const windDescription = windGustColdClime(windgust);
        return `${windNumbersDescription} ${windDescription}`;
    }
}

function showWindDescription(temp, windspeed, windgust) {
    const windDescContainer = document.createElement("div");
    windDescContainer.className = "wind-description-container";

    const windIconContainer = document.createElement("div");
    windIconContainer.className = "wind-icon-container";

    const windDescription = document.createElement("p");
    windDescription.className = "wind-description";
    windDescription.textContent = windGustDescription(temp, windspeed, windgust);

    if (windDescription.textContent !== "") {
        const windImage = document.createElement("img");
        windImage.src = windIcon;

        windIconContainer.append(windImage);
    }

    windDescContainer.append(windIconContainer, windDescription);

    return windDescContainer;
}

showForecast.addEventListener('change', async function(event) {
    event.preventDefault();
    forecastsContainer.classList.remove('hidden');
    forecastsContainer.replaceChildren();
    hideForecast.classList.remove('hidden');

    let selectedValue = showForecast.value;
    
    if (selectedValue !== "") {
        if (selectedValue === "tomorrow") {
            await displayForecast("next1days", 1);
        } 
        
        if (selectedValue === "next2days") {
            await displayForecast(selectedValue, 2);
        }

        if (selectedValue === "next5days") {
            await displayForecast(selectedValue, 5);
        }

        if (selectedValue === "next7days") {
            await displayForecast(selectedValue, 7);
        }

        if (selectedValue === "next10days") {
            await displayForecast(selectedValue, 10);
        }
    }
});

const getFutureWeather = async(selectedValue, city) => {
    let url = "";

    if (selectedValue === "tomorrow")  {
        url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}/next1days?unitGroup=us&include=day&elements=datetime,temp,feelslikemax,precipprob,conditions,description`;
    } else {
        url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}/${selectedValue}?unitGroup=us&include=day&elements=datetime,temp,feelslikemax,precipprob,conditions,description`;
    }
    
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    const dailyForecasts = data.days.map((day) => {
        return {
            datetime: day.datetime,
            temp: day.temp,
            feelslikemax: day.feelslikemax,
            precipprob: day.precipprob,
            conditions: day.conditions,
            description: day.description,
        }
    });

    return {
        city: data.resolvedAddress,
        forecast: dailyForecasts
    }
}

async function displayForecast(selectedValue, numberOfDays) {
    const city = savedCity.getCity();
    const weather = await getFutureWeather(selectedValue, city);

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
    showForecast.value = "";
});

city.value = "";
