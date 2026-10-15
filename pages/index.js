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
  BsChevronLeft,
  BsChevronRight,
  BsGeoAlt,
} from "react-icons/bs";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState(<BsSunFill />);
  const [weatherInfo, setWeatherInfo] = useState("");
  const [futureData, setFutureData] = useState([]);
  const [todayData, setTodayData] = useState([]);
  const [location, setLocation] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const todayScrollRef = useRef(null);
  const weeklyScrollRef = useRef(null);
  const searchContainerRef = useRef(null);
  const suggestionsListRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollContainer = (ref, offset) => {
    if (ref.current) {
      ref.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };
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
    return textColors[weathercode] || "#ffffff";
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

  async function fetchWeatherData(target) {
    if (!target) return;
    const isCoord = typeof target === "object" && target.latitude !== undefined;
    const queryText = isCoord ? target.name : target.trim();
    if (!queryText && !isCoord) return;

    try {
      const res = await fetch("/api/fetchWeather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(isCoord ? target : { location: queryText }),
      });
      let response = await res.json();
      console.log(response);

      if (response?.current_weather) {
        setData(response);
        setWeatherInfo(getWeatherInfo(response.current_weather.weathercode));
        setWeatherIcon(getWeatherIcons(response.current_weather.weathercode));

        let future =
          response.daily?.time?.map((timestamp, index) => {
            return { timestamp, weathercode: response.daily.weathercode[index] };
          }) || [];

        let today =
          response.hourly?.time?.map((timestamp, index) => {
            return { timestamp, weathercode: response.hourly.weathercode[index] };
          }) || [];

        setFutureData(future);
        setTodayData(today);
      }
    } catch (err) {
      console.error("Failed to fetch weather data:", err);
    }
  }

  const selectSuggestion = (item) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const displayName = item.label || item.name;
    setLocation(displayName);
    setIsOpen(false);
    setSelectedIndex(-1);
    fetchWeatherData({
      latitude: item.latitude,
      longitude: item.longitude,
      name: displayName,
    });
  };

  async function handleRequest(e) {
    if (e) e.preventDefault();
    if (isOpen && selectedIndex >= 0 && suggestions[selectedIndex]) {
      selectSuggestion(suggestions[selectedIndex]);
      return;
    }
    if (!location.trim()) return;
    setIsOpen(false);
    setSelectedIndex(-1);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    await fetchWeatherData(location.trim());
  }

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocation(val);
    setSelectedIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmed = val.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    setIsOpen(true);

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(
          `/api/suggest?q=${encodeURIComponent(trimmed)}`,
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error("Search failed");
        const json = await res.json();
        setSuggestions(json.results || []);
        setIsOpen(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Suggestion fetch error:", err);
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSuggestions(false);
        }
      }
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown" && suggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        e.preventDefault();
        selectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsListRef.current) {
      const itemEl = suggestionsListRef.current.children[selectedIndex];
      if (itemEl && typeof itemEl.scrollIntoView === "function") {
        itemEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return (
    <div className="overflow-x-hidden min-h-screen w-full flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
      <div
        id="header"
        className="flex flex-col gap-4 sm:flex-row grow-0 items-center px-5 py-3"
      >
        <a href="#" className="flex items-center text-3xl text-amber-500">
          <BsSunFill className="m-3 text-3xl" />
          <h1>Wether™</h1>
        </a>
        <div
          ref={searchContainerRef}
          className="relative w-full max-w-sm sm:w-80 m-1"
        >
          <form
            onSubmit={handleRequest}
            className="flex items-center bg-gray-200 dark:bg-slate-700 px-3 py-1 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-amber-500/50 transition-all"
          >
            <input
              type="text"
              name="location"
              placeholder="Enter City Name"
              className="flex-1 focus:outline-none bg-transparent p-1 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm sm:text-base min-w-0"
              value={location}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0 && location.trim().length >= 2) {
                  setIsOpen(true);
                }
              }}
              autoComplete="off"
              role="combobox"
              aria-expanded={isOpen}
              aria-autocomplete="list"
              aria-controls="suggestion-list"
              aria-activedescendant={
                selectedIndex >= 0
                  ? `suggestion-option-${selectedIndex}`
                  : undefined
              }
            />
            {isLoadingSuggestions && (
              <span className="shrink-0 mr-1 flex items-center justify-center">
                <svg
                  className="animate-spin h-4 w-4 text-gray-500 dark:text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              </span>
            )}
            <button
              type="submit"
              aria-label="Search weather"
              className="cursor-pointer"
            >
              <BsSearch className="text-gray-800 dark:text-gray-100 text-lg m-2" />
            </button>
          </form>

          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden py-1">
              {suggestions.length > 0 ? (
                <ul
                  ref={suggestionsListRef}
                  id="suggestion-list"
                  role="listbox"
                  className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700/50"
                >
                  {suggestions.map((item, index) => {
                    const isSelected = selectedIndex === index;
                    return (
                      <li
                        key={item.id}
                        id={`suggestion-option-${index}`}
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectSuggestion(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-amber-100/70 dark:bg-slate-700/80 text-amber-950 dark:text-amber-200"
                            : "hover:bg-gray-100 dark:hover:bg-slate-700/40 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <BsGeoAlt
                            className={`shrink-0 text-base ${
                              isSelected
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          />
                          <div className="flex flex-col min-w-0 text-left">
                            <span className="font-medium text-sm truncate">
                              {item.name}
                            </span>
                            {(item.admin1 || item.country) && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {[item.admin1, item.country]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                        {item.country_code && (
                          <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-900/60 text-gray-600 dark:text-gray-400 shrink-0 ml-2">
                            {item.country_code}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                !isLoadingSuggestions &&
                location.trim().length >= 2 && (
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No locations found
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
      <div className="m-3 lg:m-8">
        {data && (
          <div
            className="flex flex-col grow bg-cover rounded-xl"
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
          <div className="space-y-8 mt-6">
            {todayData && todayData.length > 0 && (
              <div className="flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700 pb-2 mb-3">
                  <h2 className="text-2xl font-bold">Today's weather</h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scrollContainer(todayScrollRef, -320)}
                      aria-label="Scroll left in today's weather"
                      className="p-2 rounded-full bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 transition-colors shadow-sm cursor-pointer"
                    >
                      <BsChevronLeft className="text-sm" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollContainer(todayScrollRef, 320)}
                      aria-label="Scroll right in today's weather"
                      className="p-2 rounded-full bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 transition-colors shadow-sm cursor-pointer"
                    >
                      <BsChevronRight className="text-sm" />
                    </button>
                  </div>
                </div>
                <div
                  ref={todayScrollRef}
                  className="weather-scroll flex overflow-x-auto gap-4 py-3 px-1 scroll-smooth"
                >
                  {todayData.slice(0, 25).map((i) => (
                    <div
                      key={i.timestamp}
                      className="shrink-0 w-36 sm:w-44 h-32 p-4 rounded-xl shadow-md bg-cover bg-center flex flex-col justify-between transition-transform duration-200 hover:scale-[1.02]"
                      style={{
                        backgroundImage: `url(https://pkkcdn.netlify.app/weather/${i.weathercode}.jpg)`,
                        color: `${getColor(i.weathercode)}`,
                      }}
                    >
                      <span className="font-semibold text-sm sm:text-base whitespace-nowrap">
                        {new Date(i.timestamp * 1000).toLocaleTimeString(
                          undefined,
                          { hour: "numeric", minute: "numeric", hour12: true }
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="shrink-0 text-xl">
                          {getWeatherIcons(i.weathercode)}
                        </span>
                        <span
                          className="truncate text-sm font-medium"
                          title={getWeatherInfo(i.weathercode)}
                        >
                          {getWeatherInfo(i.weathercode)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {futureData && futureData.length > 0 && (
              <div className="flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700 pb-2 mb-3">
                  <h2 className="text-2xl font-bold">Weekly weather</h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scrollContainer(weeklyScrollRef, -320)}
                      aria-label="Scroll left in weekly weather"
                      className="p-2 rounded-full bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 transition-colors shadow-sm cursor-pointer"
                    >
                      <BsChevronLeft className="text-sm" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollContainer(weeklyScrollRef, 320)}
                      aria-label="Scroll right in weekly weather"
                      className="p-2 rounded-full bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 transition-colors shadow-sm cursor-pointer"
                    >
                      <BsChevronRight className="text-sm" />
                    </button>
                  </div>
                </div>
                <div
                  ref={weeklyScrollRef}
                  className="weather-scroll flex overflow-x-auto gap-4 py-3 px-1 scroll-smooth"
                >
                  {futureData.map((i) => (
                    <div
                      key={i.timestamp}
                      className="shrink-0 w-36 sm:w-44 h-32 p-4 rounded-xl shadow-md bg-cover bg-center flex flex-col justify-between transition-transform duration-200 hover:scale-[1.02]"
                      style={{
                        backgroundImage: `url(https://pkkcdn.netlify.app/weather/${i.weathercode}.jpg)`,
                        color: `${getColor(i.weathercode)}`,
                      }}
                    >
                      <span className="font-semibold text-sm sm:text-base whitespace-nowrap">
                        {new Date(i.timestamp * 1000).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="shrink-0 text-xl">
                          {getWeatherIcons(i.weathercode)}
                        </span>
                        <span
                          className="truncate text-sm font-medium"
                          title={getWeatherInfo(i.weathercode)}
                        >
                          {getWeatherInfo(i.weathercode)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
