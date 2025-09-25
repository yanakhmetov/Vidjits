import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';

const MovieSearchWidget = () => {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState('The Lord of the Rings');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = 'b4dc76e';
        const response = await axios.get(
          `https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`
        );

        if (response.data.Response === 'True') {
          setMovies(response.data.Search);
        } else {
          setMovies([]);
          setError(response.data.Error || 'Фильмы не найдены');
        }
      } catch (err) {
        console.error('Error fetching movie data:', err);
        setError('Ошибка при загрузке данных');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (query.trim()) {
        fetchMovies();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Эффект для автозаполнения фильмов
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const apiKey = 'b4dc76e';
        const response = await axios.get(
          `https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`
        );

        if (response.data.Response === 'True') {
          setSuggestions(response.data.Search.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching movie suggestions:', err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

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

  const handleSuggestionClick = (title) => {
    setQuery(title);
    setShowSuggestions(false);
  };

  return (
    <div className="widget movie-search-widget">
      <h3>Поиск фильмов</h3>
      <div className="autocomplete-container" ref={containerRef}>
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Введите название фильма"
          />
          <FaSearch className="search-icon" />
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions
              .filter(movie => movie.Poster !== 'N/A')
              .map((movie) => (
              <li
                key={movie.imdbID}
                onClick={() => handleSuggestionClick(movie.Title)}
                onMouseDown={(e) => e.preventDefault()} // Предотвращаем потерю фокуса
              >
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  className="suggestion-poster"
                />
                <span>{movie.Title} ({movie.Year})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {loading ? (
        <p className="loading">Загрузка фильмов...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : movies.length > 0 ? (
        <div className="movie-slider">
          {movies
            .filter(movie => movie.Poster !== 'N/A')
            .map((movie) => (
            <div className="movie-card" key={movie.imdbID}>
              <img
                className="movie-poster"
                src={movie.Poster}
                alt={movie.Title}
              />
              <div className="movie-title">{movie.Title}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="error">Введите название фильма для поиска</p>
      )}
    </div>
  );
};

export default MovieSearchWidget;