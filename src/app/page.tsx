/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { weatherSerrvice } from "@/services/weaather.service";
import { useEffect, useState } from "react";
import { X, Star } from "lucide-react"; 

export default function Home() {
  const [searchedWeathers, setSearchedWeathers] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [favoriteCity, setFavoriteCity] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<{ [city: string]: any[] }>({});

  useEffect(() => {
    const storedFav = localStorage.getItem("favoriteCity");
    if (storedFav) {
      setFavoriteCity(storedFav);
      handleWeather(storedFav);
    }
  }, []);

  const handleForcast = async (city: string) => {
    try {
      const res = await weatherSerrvice.getForcast(city);
      if (res && res.list) {
        const dailyForecast: any[] = [];
        const usedDates: Set<string> = new Set();

        res.list.forEach((item: any) => {
          const date = item.dt_txt.split(" ")[0];
          if (!usedDates.has(date) && dailyForecast.length < 5) {
            dailyForecast.push(item);
            usedDates.add(date);
          }
        });

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
        handleForcast(city);
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
    <div className="flex flex-col items-center justify-center text-lg mt-10 px-10">
      <p className="border-b-2 mb-5 text-xl font-semibold text-white">
        Welcome to QuickWeather!
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 mb-6 w-full max-w-md"
      >
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter the city"
            name="city"
            className="border p-2 rounded flex-1"
          />
          <input
            type="submit"
            value={"Search"}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          />
        </div>
        {errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {[...searchedWeathers].reverse().map((weather, index) => (
          <div
            key={index}
            className="relative border rounded-lg p-4 shadow-md bg-black text-white"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold">
                {weather.name}, {weather.sys.country}
              </h2>
              <div className="flex gap-2">
                <Star
                  onClick={() => handleFavorite(weather.name)}
                  className={`w-5 h-5 cursor-pointer ${
                    favoriteCity?.toLowerCase() === weather.name.toLowerCase()
                      ? "text-yellow-400"
                      : "text-gray-500"
                  }`}
                />
                <X
                  onClick={() => handleDelete(index)}
                  className="w-5 h-5 text-red-400 cursor-pointer"
                />
              </div>
            </div>

            <p className="text-gray-300 capitalize">
              {weather.weather[0]?.description}
            </p>

            <div className="flex items-center gap-2 my-2">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0]?.icon}@2x.png`}
                alt={weather.weather[0]?.description}
                className="w-12 h-12"
              />
              <p className="text-2xl font-semibold">{weather.main.temp}°C</p>
            </div>

            <p>Feels like: {weather.main.feels_like}°C</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Wind: {weather.wind.speed} m/s</p>

            {/* 5-day forecast */}
            <div className="mt-4 border-t border-gray-700 pt-2">
              <p className="font-semibold mb-2">5-Day Forecast</p>
              <div className="flex justify-between">
                {(forecastData[weather.name.toLowerCase()] || []).map(
                  (fcast, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center text-sm"
                    >
                      <p className="font-medium">
                        {new Date(fcast.dt_txt).toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </p>
                      <img
                        src={`https://openweathermap.org/img/wn/${fcast.weather[0]?.icon}@2x.png`}
                        alt={fcast.weather[0]?.description}
                        className="w-10 h-10"
                      />
                      <p>{Math.round(fcast.main.temp)}°C</p>
                      <p className="capitalize">{fcast.weather[0]?.main}</p>
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
