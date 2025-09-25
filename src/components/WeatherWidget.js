import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('Moscow');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!city.trim()) {
      setWeatherData(null);
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = '4d2df11eee63635a853ab91521305365';
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        if (response.status === 200) {
          setWeatherData(response.data);
        } else {
          setError('Город не найден');
        }
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError('Ошибка при загрузке погоды');
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchWeather();
    }, 800);

    return () => clearTimeout(timer);
  }, [city]);

  // Эффект для автозаполнения городов
  useEffect(() => {
    if (!city.trim() || city.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const apiKey = '4d2df11eee63635a853ab91521305365';
        const response = await axios.get(
          `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=10&appid=${apiKey}`
        );

        if (response.data) {
          setSuggestions(response.data.map(item => ({
            name: item.name,
            country: item.country,
            state: item.state,
            fullName: `${item.name}${item.state ? `, ${item.state}` : ''}, ${item.country}`
          })));
        }
      } catch (err) {
        console.error('Error fetching city suggestions:', err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [city]);

  // Обработка кликов вне контейнера
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (fullName) => {
    setCity(fullName);
    setShowSuggestions(false);
    setWeatherData(null);
  };

  return (
    <div className="widget weather-widget">
      <h3>Погода в {city || '...'}</h3>
      <div className="autocomplete-container" ref={containerRef}>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Введите город"
          />
          <FaSearch className="search-icon" />
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(item.fullName)}
                onMouseDown={(e) => e.preventDefault()}
              >
                {item.name}{item.state ? `, ${item.state}` : ''}, {item.country}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {loading ? (
        <p className="loading">Загрузка погоды...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : weatherData ? (
        <div className="weather-content">
          <div className="weather-icon">
            <img
              src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
              alt={weatherData.weather[0].description}
            />
          </div>
          <div className="weather-info">
            <div className="weather-temp">{Math.round(weatherData.main.temp)}°C</div>
            <div className="weather-description">
              {weatherData.weather[0].description}
            </div>
          </div>
          <div className="weather-details">
            <div className="weather-detail">
              <span>🌬️</span>
              Ветер: {weatherData.wind.speed} м/с
            </div>
            <div className="weather-detail">
              <span>💧</span>
              Влажность: {weatherData.main.humidity}%
            </div>
            <div className="weather-detail">
              <span>🌡️</span>
              Давление: {weatherData.main.pressure} hPa
            </div>
            <div className="weather-detail">
              <span>👁️</span>
              Видимость: {weatherData.visibility / 1000} км
            </div>
          </div>
        </div>
      ) : (
        <p className="error">Введите название города</p>
      )}
    </div>
  );
};

export default WeatherWidget;