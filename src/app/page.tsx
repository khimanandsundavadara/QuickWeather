/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { weatherSerrvice } from "@/services/weaather.service";
import { useEffect, useState } from "react";

export default function Home() {
  const [searchedWeathers, setSearchedWeathers] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [favoriteCity, setFavoriteCity] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<{ [city: string]: any[] }>({});
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedFav = localStorage.getItem("favoriteCity");
    if (storedFav) {
      setFavoriteCity(storedFav);
      handleWeather(storedFav);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", String(!darkMode));
  };

  const handleForcast = async (city: string) => {
    try {
      const res = await weatherSerrvice.getForcast(city);
      if (res && res.list) {
        let dailyForecast: any[] = [];
        const usedDates: Set<string> = new Set();
        res.list.forEach((item: any) => {
          const date = item.dt_txt.split(" ")[0];
          if (!usedDates.has(date)) {
            dailyForecast.push(item);
            usedDates.add(date);
          }
        });
        dailyForecast = dailyForecast.slice(1);
        setForecastData((prev) => ({
          ...prev,
          [city.toLowerCase()]: dailyForecast,
        }));
      }
    } catch (error) {
      console.error("Forecast error:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const city = (e.target as any).city.value;
    handleWeather(city);
    (e.target as HTMLFormElement).reset();
  };

  const handleWeather = async (city: string) => {
    try {
      const res = await weatherSerrvice.getAll(city);
      if (res) {
        setSearchedWeathers((prevArray) => {
          const updated = prevArray.filter(
            (w) => w.name.toLowerCase() !== res.name.toLowerCase()
          );
          return [...updated, res];
        });
        setErrorMessage("");
        handleForcast(res.name);
      }
    } catch (error: any) {
      console.error("Error fetching weather:", error);
      if (error.response?.status === 404) {
        setErrorMessage("City not found. Please try again.");
      } else {
        setErrorMessage("Something went wrong. Please try again later.");
      }
    }
  };

  const handleDelete = (index: number) => {
    index = searchedWeathers.length - index - 1;
    setSearchedWeathers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFavorite = (cityName: string) => {
    if (favoriteCity?.toLowerCase() === cityName.toLowerCase()) {
      setFavoriteCity(null);
      localStorage.removeItem("favoriteCity");
    } else {
      setFavoriteCity(cityName);
      localStorage.setItem("favoriteCity", cityName);
    }
  };

  return (
    <div
      className={`min-h-screen px-5 py-5 ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="flex justify-end mb-5">
        <button
          onClick={toggleDarkMode}
          className="border px-4 py-2"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">QuickWeather</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter city"
            name="city"
            className={`border p-2 flex-1 ${
              darkMode
                ? "bg-black text-white border-gray-500"
                : "bg-white text-black border-gray-400"
            }`}
          />
          <button type="submit" className="border px-4 py-2 bg-blue-500 text-white">
            Search
          </button>
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
      </form>

      <div className="grid gap-4">
        {[...searchedWeathers].reverse().map((weather, index) => (
          <div
            key={index}
            className={`border p-4 ${
              darkMode
                ? "bg-black border-gray-500 text-white"
                : "bg-white border-gray-400 text-black"
            }`}
          >
            <div className="flex justify-between">
              <h2 className="font-bold">
                {weather.name}, {weather.sys.country}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFavorite(weather.name)}
                  className="underline"
                >
                  {favoriteCity?.toLowerCase() === weather.name.toLowerCase()
                    ? "★ Fav"
                    : "☆ Fav"}
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-500 underline"
                >
                  Delete
                </button>
              </div>
            </div>

            <p>{weather.weather[0]?.description}</p>
            <p className="text-lg">{weather.main.temp}°C</p>
            <p>Feels like: {weather.main.feels_like}°C</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Wind: {weather.wind.speed} m/s</p>

            <div className="mt-4 border-t pt-2">
              <p className="font-semibold">5-Day Forecast</p>
              <div className="flex gap-4">
                {(forecastData[weather.name.toLowerCase()] || []).map(
                  (fcast, idx) => (
                    <div key={idx} className="text-sm">
                      <p>
                        {new Date(fcast.dt_txt).toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </p>
                      <p>{Math.round(fcast.main.temp)}°C</p>
                      <p>{fcast.weather[0]?.main}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
