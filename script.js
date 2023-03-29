// variables
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const userInfoContainer = document.querySelector(".user-info-container");
const grantAccessContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const searchInp = document.querySelector("[data-searchInp]");

const apiErrorContainer = document.querySelector(".api-error-container");

let currentTab = userTab;
const API_KEY = "f24e7161d24eae17c461307f2144cbc4";

// setting default tab

currentTab.classList.add("current-tab");

function switchTab(clickedTab) {
  apiErrorContainer.classList.remove("active");

  if (clickedTab !== currentTab) {
    currentTab.classList.remove("current-tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");

    if (!searchForm.classList.contains("active")) {
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      getFromSessionStorage();
    }
  }
}

userTab.addEventListener("click", () => {
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  switchTab(searchTab);
});

// weather handling

const grantAcessBtn = document.querySelector("[data-grantAccess]");

const messageText = document.querySelector("data-messageText");
const loadingScreen = document.querySelector(".loading-container");
const apiErrorImg = document.querySelector("[data-notFoundImg");
const apiErrorMessage = document.querySelector("[data-apiErrorText");
const apiErrorBtn = document.querySelector("[data-apiErrorBtn");

// check coords is present or not

function getFromSessionStorage() {
  const localCoords = sessionStorage.getItem("user-coordinates");
  if (!localCoords) {
    grantAccessContainer.classList.add("active");
  } else {
    const coords = JSON.parse(localCoords);
    fetchUserWeatherInfo(coords);
  }
}

// get coords from geolocation

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    grantAcessBtn.style.display = "none";
    messageText.innerText = "Geolocation is not supported by this browser";
  }
}

// store coords
function showPosition(position) {
  const userCoords = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };

  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoords));
  fetchUserWeatherInfo(userCoords);
}

// handle errors

function showError(error) {
  switch (error.code) {
    case error.PERMISSTION_DENIED:
      messageText.innerText = "You denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      messageText.innerText = "Location information is unavailable.";
      break;

    case error.TIMEOUT:
      messageText.innerText = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      messageText.innerText = "An unknown error occurred.";
      break;
  }
}

getFromSessionStorage();
grantAcessBtn.addEventListener("click", getLocation);

// fetch api

async function fetchUserWeatherInfo(coords) {
  const { lat, lon } = coords;
  grantAccessContainer.classList.remove("active");
  loadingScreen.classList.add("active");

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await res.json();

    if (!data.sys) {
      throw data;
    }

    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (error) {
    loadingScreen.classList.remove("active");
    apiErrorContainer.classList.add("active");
    apiErrorImg.style.display = "none";
    apiErrorMessage.innerText = `Error: ${error?.message}`;

    apiErrorBtn.addEventListener("click", fetchUserWeatherInfo);
  }
}

// render weather info

function renderWeatherInfo(weatherInfo) {
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

  cityName.innerText = weatherInfo?.name;

  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.main;

  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;

  temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;

  windspeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)}m/s`;

  humidity.innerText = `${weatherInfo?.main?.humidity}%`;

  cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

// search weather

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (searchInp.value === "") return;

  fetchSearchWeatherInfo(searchInp.value);
  searchInp.value = "";
});

async function fetchSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  apiErrorContainer.classList.remove("active");

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    const data = await res.json();
    if (!data.sys) {
      throw data;
    }
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (error) {
    loadingScreen.classList.remove("active");
    apiErrorContainer.classList.add("active");
    apiErrorMessage.innerText = `Error: ${error?.message}`;
    apiErrorBtn.style.display = "none";
  }
}
