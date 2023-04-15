import {
  BsSearch,
  BsCloudLightningRain,
  BsCloudLightningRainFill,
  BsSunFill,
  BsCloudSnow,
  BsFillCloudRainHeavyFill,
  BsWind,
  BsFillCloudyFill,
  BsCloudFog2Fill,
  BsCloudDrizzleFill,
  BsCloudRainFill,
  BsCloudSnowFill,
} from "react-icons/bs";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function Home() {
  const [data, setData] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState(<BsSunFill />);
  const [weatherInfo, setWeatherInfo] = useState("");
  const [futureData, setFutureData] = useState([]);
  const [todayData, setTodayData] = useState([]);
  const { register, handleSubmit } = useForm();
  const weatherInfoMap = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Heavy Drizzle",
    56: "Light Freezing Drizzle",
    57: "Heavy Freezing Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    66: "Light Freezing Rain",
    67: "Heavy Freezing Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Slight/Moderate Thunderstorm",
    96: "Thunderstorm with Slight Hail",
    99: "Thunderstorm with Heavy Hail",
  };

  function getWeatherInfo(weathercode) {
    return weatherInfoMap[weathercode];
  }

  const textColors = {
    0: "#292929",
    1: "#464646",
    2: "#464646",
    3: "#464646",
    45: "#505050",
    48: "#505050",
    51: "#505050",
    53: "#505050",
    55: "#505050",
    56: "#505050",
    57: "#505050",
    61: "#1E0303",
    63: "#1E0303",
    65: "#1E0303",
    66: "#1E0303",
    67: "#1E0303",
    71: "#373737",
    73: "#373737",
    75: "#373737",
    77: "#373737",
    80: "#ffffff",
    81: "#ffffff",
    82: "#ffffff",
    85: "#ffffff",
    86: "#ffffff",
    95: "#ffffff",
    96: "#ffffff",
    99: "#ffffff",
  };

  function getColor(weathercode) {
    return textColors[weathercode];
  }

  const weatherIcons = {
    0: <BsSunFill />,
    1: <BsFillCloudyFill />,
    2: <BsFillCloudyFill />,
    3: <BsFillCloudyFill />,
    45: <BsCloudFog2Fill />,
    48: <BsCloudFog2Fill />,
    51: <BsCloudDrizzleFill />,
    53: <BsCloudDrizzleFill />,
    55: <BsCloudDrizzleFill />,
    56: <BsCloudDrizzleFill />,
    57: <BsCloudDrizzleFill />,
    61: <BsCloudRainFill />,
    63: <BsCloudRainFill />,
    65: <BsCloudRainFill />,
    66: <BsCloudRainFill />,
    67: <BsCloudRainFill />,
    71: <BsCloudSnow />,
    73: <BsCloudSnow />,
    75: <BsCloudSnow />,
    77: <BsCloudSnow />,
    80: <BsFillCloudRainHeavyFill />,
    81: <BsFillCloudRainHeavyFill />,
    82: <BsFillCloudRainHeavyFill />,
    85: <BsCloudSnowFill />,
    86: <BsCloudSnowFill />,
    95: <BsCloudLightningRain />,
    96: <BsCloudLightningRainFill />,
    99: <BsCloudLightningRainFill />,
  };

  function getWeatherIcons(weathercode) {
    return weatherIcons[weathercode];
  }

  async function handleRequest(formdata) {
    const res = await fetch("/api/fetchWeather", {
      method: "POST",
      body: formdata.location,
    });
    let response = await res.json();
    console.log(response);
    await setData(response);
    console.log(data);

    setWeatherInfo(getWeatherInfo(response.current_weather.weathercode));

    setWeatherIcon(getWeatherIcons(response.current_weather.weathercode));

    let future = response.daily.time.map((timestamp, index) => {
      return { timestamp, weathercode: response.daily.weathercode[index] };
    });

    let today = response.hourly.time.map((timestamp, index) => {
      return { timestamp, weathercode: response.hourly.weathercode[index] };
    });

    setFutureData(future);
    setTodayData(today);
  }

  return (
    <div className="overflow-x-hidden h-screen w-screen flex flex-col bg-white text-gray-900">
      <div
        id="header"
        className="flex flex-col sm:flex-row grow-0 items-center text-amber-500 "
      >
        <a href="#" className="flex items-center">
          <BsSunFill className="text-3xl m-3" />
          <h1 className="text-2xl">Wether</h1>
        </a>
        <form
          onSubmit={handleSubmit(handleRequest)}
          className="flex items-center bg-gray-200 p-1 rounded-full m-3"
        >
          <input
            type="text"
            name="location"
            placeholder="Enter City Name"
            className="focus:outline-none bg-transparent border-r p-1 border-gray-800 text-gray-900"
            {...register("location")}
          ></input>
          <button type="submit">
            {" "}
            <BsSearch className="text-gray-800 text-lg m-2" />{" "}
          </button>
        </form>
      </div>
      {data && (
        <div
          className="flex flex-col grow bg-cover"
          style={{
            backgroundImage: `url(https://pkkcdn.netlify.app/weather/${data.current_weather.weathercode}.jpg)`,
            color: `${getColor(data.current_weather.weathercode)}`,
          }}
        >
          <div className="flex items-center justify-center md:justify-end grow bg-cover">
            <div className="p-10 m-10 rounded-xl backdrop-brightness-200 backdrop-blur-3xl">
              <h1 className="text-5xl sm:text-8xl flex flex-col items-start">
                <span className="text-xl sm:text-3xl">{data.name}</span>
                <span className="flex">
                  <span className="flex items-end justify-between">
                    <span className="text-3xl sm:text-6xl p-3">
                      {weatherIcon}
                    </span>
                    {data.current_weather.temperature}
                  </span>
                  <span className="text-3xl sm:text-6xl">°C</span>
                </span>
                <span className="text-2xl sm:text-3xl">{weatherInfo}</span>
              </h1>
              <p className="text-lg sm:text-2xl m-3 flex items-center">
                <BsWind />
                <span className="mx-2 sm:text-lg">
                  {data.current_weather.winddirection}°&nbsp;
                  {data.current_weather.windspeed} km/h
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
      {data && (
        <div>
          {todayData && (
            <div className="flex flex-col py-10 items-center overflow-y-hidden overflow-x-auto h-max">
              <h1 className="w-full p-3 border-b text-2xl">Today's weather</h1>
              <div className="flex items-center">
              {todayData.slice(0, 25).map((i) => (
                <div
                  className="grow rounded-xl h-min w-2/12 items-center bg-gradient-to-br p-3 m-3"
                  style={{
                    backgroundImage: `url(https://pkkcdn.netlify.app/weather/${i.weathercode}.jpg)`,
                    color: `${getColor(i.weathercode)}`,
                  }}
                >
                  <h1 className="">
                    {new Date(i.timestamp * 1000).toLocaleTimeString(
                      undefined,
                      { hour: "numeric", minute: "numeric", hour12: true }
                    )}
                  </h1>
                  <p className="truncate   flex items-center">
                    {getWeatherIcons(i.weathercode)}&nbsp;
                    <span className="text-ellipsis overflow-hidden">
                      {getWeatherInfo(i.weathercode)}
                    </span>
                  </p>
                </div>
              ))}
              </div>
            </div>
          )}
          {futureData && (
            <div className="flex flex-col justify-start items-start backdrop-blur-3xl">
              <h1 className="text-2xl m-3 border-b w-full">
                This week
              </h1>
              <div className="flex overflow-x-auto">
                {futureData.map((i) => (
                  <div
                    className="w-1/6 backdrop-brightness-200 backdrop-blur-3xl bg-gradient-to-br p-3 m-3 bg-cover rounded-xl from-gray-200 to-gray-100"
                    style={{
                      backgroundImage: `url(https://pkkcdn.netlify.app/weather/${i.weathercode}.jpg)`,
                      color: `${getColor(i.weathercode)}`,
                    }}
                  >
                    <p>
                      {new Date(i.timestamp * 1000).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "long",
                        }
                      )}
                    </p>
                    <p className="flex truncate items-center">
                      {getWeatherIcons(i.weathercode)}&nbsp;
                      {getWeatherInfo(i.weathercode)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
