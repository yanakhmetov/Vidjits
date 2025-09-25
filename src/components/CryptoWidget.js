import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CryptoWidget = () => {
  const [cryptoData, setCryptoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Иконки и названия
  const cryptoList = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ' },
    { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', icon: 'Ł' }
  ];

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        const ids = cryptoList.map(c => c.id).join(',');
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (response.data) {
          // Добавляем дополнительную информацию к данным
          const enhancedData = cryptoList.map(crypto => ({
            ...crypto,
            price: response.data[crypto.id]?.usd || 0,
            change: response.data[crypto.id]?.usd_24h_change || 0
          }));
          
          setCryptoData(enhancedData);
        } else {
          setError('Данные не получены');
        }
      } catch (err) {
        console.error('Error fetching crypto data:', err);
        setError('Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
    
    // Обновляем каждые 2 минуты
    const interval = setInterval(fetchCryptoData, 120000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="widget crypto-widget">
      <h3>Криптовалюты</h3>
      
      {loading ? (
        <p className="loading">Загрузка курсов...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : cryptoData ? (
        <div className="crypto-list">
          {cryptoData.map((crypto) => (
            <div className="crypto-item" key={crypto.id}>
              <div className="crypto-name">
                <div className="crypto-icon">
                  {crypto.icon}
                </div>
                <div>
                  <div className="crypto-fullname">{crypto.name}</div>
                  <div className="crypto-symbol">{crypto.symbol}</div>
                </div>
              </div>
              <div className="crypto-info">
                <div className="crypto-price">${crypto.price.toLocaleString()}</div>
                <div className={`crypto-change ${crypto.change >= 0 ? 'positive' : 'negative'}`}>
                  {crypto.change >= 0 ? '↑' : '↓'} {Math.abs(crypto.change).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="error">Данные недоступны</p>
      )}
    </div>
  );
};

export default CryptoWidget;