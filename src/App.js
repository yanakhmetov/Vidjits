import React from 'react';
import WeatherWidget from './components/WeatherWidget';
import CryptoWidget from './components/CryptoWidget';
import MovieSearchWidget from './components/MovieSearchWidget';
import './styles.css';

const App = () => {
   return (
    <div className="dashboard">
     
      <div className="widgets-top-row">
        <WeatherWidget />
        <CryptoWidget />
      </div>

      <MovieSearchWidget />
    </div>
  );
};

export default App;