let weatherAPIKey = "6a86feb924ce8b6bb127bec52286a9a0";
let weatherBaseEndPoint =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&appid=" +
  weatherAPIKey;

let forecastBaseEndPoint =
  "https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=" +
  weatherAPIKey;

let geoCodingEndPoint =
  "http://api.openweathermap.org/geo/1.0/direct?limit=5&appid=" + weatherAPIKey;

let locationAPIKey = "pk.19cece3ac2407117342d85a7ea3e7ab7";

let locationIQBaseEndPoint =
  "https://us1.locationiq.com/v1/reverse.php?format=json&key=" + locationAPIKey;

let weatherImage = [
  {
    url: "images/broken-clouds.png",
    ids: [803, 804],
  },
  {
    url: "images/clear-sky.png",
    ids: [800],
  },
  {
    url: "images/few-coluds.png",
    ids: [801],
  },
  {
    url: "images/mist.png",
    ids: [701, 711, 721, 741, 731, 751, 761, 762, 771, 781],
  },
  {
    url: "images/rain.png",
    ids: [501, 502, 503, 504],
  },
  {
    url: "images/scattered-clouds.png",
    ids: [802],
  },
  {
    url: "images/shower-rain.png",
    ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321],
  },
  {
    url: "images/snow.png",
    ids: [511, 600, 601, 602, 612, 611, 613, 615, 616, 622, 621],
  },
  {
    url: "images/thunderstorm.png",
    ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
  },
];

let searchInp = document.querySelector("input[type='search'");
let city = document.querySelector(".city");
let day = document.querySelector(".day");
let humidity = document.querySelector(".weather_indicator--humidity>span");
let wind = document.querySelector(".weather_indicator--wind>span");
let pressure = document.querySelector(".weather_indicator--pressure>span");
let temprature = document.querySelector(".temprature>span");
let weather_img = document.querySelector(".weather_img");
let datalist = document.getElementById("suggetions");

window.addEventListener("load", loadCurrentWeather);

let getWeatherByCityName = async (city) => {
  let endPoint = weatherBaseEndPoint + "&q=" + city;
  let response = await fetch(endPoint);
  let data = await response.json();
  return data;
};

async function loadCurrentWeather() {
  let option = { enableHighFrequency: true, timeout: 5000 };
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      let crd = pos.coords;
      let lat = crd.latitude;
      let lon = crd.longitude;
      let BaseUrl = locationIQBaseEndPoint + "&lat=" + lat + "&lon=" + lon;
      let response = await fetch(BaseUrl);
      let data = await response.json();
      Swal.fire({
        title: "Got The Location",
        text: "City : " + "Bhopal", // data.address.city,
        icon: "success",
      });
      let weather = await getWeatherByCityName("Bhopal" /*data.address.city*/);
      updateCurrentWeather(weather);
      let id = weather.id;
      let forecastData = await getForecastByCityId(id);
      updateForecast(forecastData);
    },
    (error) => {
      console.log(error);
    },
    option
  );
}

let getForecastByCityId = async (id) => {
  let endPoint = forecastBaseEndPoint + "&id=" + id;
  let forecast = await fetch(endPoint);
  let forecastData = await forecast.json();
  let forcastList = forecastData.list;
  let daily = [];
  forcastList.forEach((day) => {
    let date_txt = day.dt_txt;
    date_txt = date_txt.replace(" ", "T");
    let d = new Date(date_txt);
    let hours = d.getHours();
    if (hours === 12) daily.push(day);
  });
  return daily;
};

let dayOfWeek = (date = new Date().getTime()) => {
  let today = new Date(date).toLocaleDateString("en-EN", { weekday: "long" });
  return today;
};
let updateCurrentWeather = (data) => {
  city.innerText = data.name;
  day.innerText = dayOfWeek();
  humidity.innerText = data.main.humidity;
  pressure.innerText = data.main.pressure;
  let windDirection;
  let deg = data.wind.deg;
  if (deg > 45 && deg <= 135) windDirection = "East";
  else if (deg > 135 && deg <= 225) windDirection = "South";
  else if (deg > 225 && deg <= 315) windDirection = "West";
  else windDirection = "North";

  wind.innerText = windDirection + "," + data.wind.speed;
  let temp = Math.round(data.main.temp);
  temprature.innerText = temp > 0 ? "+" + temp : temp;

  let imgId = data.weather[0].id;
  weatherImage.forEach((obj) => {
    if (obj.ids.indexOf(imgId) !== -1) weather_img.src = obj.url;
  });
};

let updateForecast = (forecast) => {
  let cards = document.querySelectorAll(".card-body");
  for (let i = 0; i < forecast.length; i++) {
    let day = dayOfWeek(forecast[i].dt * 1000);
    let temp = Math.round(forecast[i].main.temp);
    temp = temp > 0 ? "+" + temp : temp;

    let icon = forecast[i].weather[0].icon;
    let desp = forecast[i].weather[0].description;

    let nodes = cards[i].children;
    nodes[0].src = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
    nodes[0].alt = desp;
    nodes[1].innerText = day;
    nodes[2].innerHTML = temp + "&deg;C";
  }
};

let weatherForCity = async (city) => {
  let weather = await getWeatherByCityName(searchInp.value);
  console.log(weather);
  if (weather.cod == 404) {
    Swal.fire({
      title: "OOPs...",
      text: "You Typed Wrong City Name",
      icon: "error",
    });
    return;
  } else {
    Swal.fire({
      title: "Got The Location",
      text: "City : " + weather.name,
      icon: "success",
    });
  }
  updateCurrentWeather(weather);
  let id = weather.id;
  let forecastData = await getForecastByCityId(id);
  updateForecast(forecastData);
};
searchInp.addEventListener("keydown", (e) => {
  if (e.keyCode === 13) {
    weatherForCity(searchInp.value);
  }
});
searchInp.addEventListener("input", async (e) => {
  if (searchInp.value.length > 1) {
    let endPoint = geoCodingEndPoint + "&q=" + searchInp.value;
    let response = await fetch(endPoint);
    let data = await response.json();
    let cities = "";
    data.forEach((obj) => {
      cities += `<option>${obj.name}${obj.state ? "," + obj.state : ""},${
        obj.country
      }</option>`;
    });
    datalist.innerHTML = cities;
  }
});
