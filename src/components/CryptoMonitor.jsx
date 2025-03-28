import React, { useState, useEffect } from 'react';
import { getHistoricalData, getCryptoList, setupRealtimeData, convertCurrency, fetchExchangeRates, getLastExchangeRateUpdate } from '../services/api';
import D3Chart from './D3Chart';
import RechartsChart from './RechartsChart';
import UPlotChart from './UPlotChart';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

function CryptoMonitor() {
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [selectedCurrency, setSelectedCurrency] = useState('usd');
  const [timeRange, setTimeRange] = useState(7); // days
  const [historicalData, setHistoricalData] = useState([]);
  const [realtimeData, setRealtimeData] = useState([]);
  const [cryptoList, setCryptoList] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreenChart, setFullscreenChart] = useState(null); // null, 'd3', 'recharts', ou 'uplot'
  const [lastRatesUpdate, setLastRatesUpdate] = useState(0);

  // Fetch exchange rates and update the last update timestamp
  useEffect(() => {
    const updateExchangeRates = async () => {
      try {
        await fetchExchangeRates();
        setLastRatesUpdate(getLastExchangeRateUpdate());
      } catch (err) {
        console.error('Error updating exchange rates:', err);
      }
    };
    
    // Update exchange rates immediately
    updateExchangeRates();
    
    // Set up interval to update exchange rates every 10 minutes
    const interval = setInterval(async () => {
      await updateExchangeRates();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch available cryptocurrencies list
  useEffect(() => {
    const fetchCryptoList = async () => {
      try {
        const data = await getCryptoList(20);
        setCryptoList(data);
      } catch (err) {
        setError('Error loading cryptocurrency list');
        console.error(err);
      }
    };

    fetchCryptoList();
  }, []);

  // Fetch historical data when cryptocurrency, currency or time range changes
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      try {
        const data = await getHistoricalData(selectedCrypto, timeRange, selectedCurrency);
        setHistoricalData(data);
        setLoading(false);
      } catch (err) {
        setError('Error loading historical data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchHistoricalData();
  }, [selectedCrypto, timeRange, selectedCurrency]);

  // Set up real-time data
  useEffect(() => {
    // Initialize with recent historical data
    if (historicalData.length > 0) {
      // Get the last 100 data points or less if there aren't that many
      const recentData = historicalData.slice(-100);
      setRealtimeData(recentData);
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (historicalData.length > 0) {
        // Add a new data point with a small random variation
        const lastPoint = realtimeData[realtimeData.length - 1] || historicalData[historicalData.length - 1];
        const lastPrice = lastPoint[1];
        const randomChange = lastPrice * (0.995 + Math.random() * 0.01); // Variation from -0.5% to +0.5%
        const newPoint = [Date.now(), randomChange];
        
        setRealtimeData(prevData => {
          // Keep only the last 100 points for performance
          const newData = [...prevData, newPoint].slice(-100);
          return newData;
        });

        // Update current price
        setCurrentPrice(randomChange);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [historicalData]);

  // Calculate percentage change
  const calculateChange = () => {
    if (!historicalData.length || !currentPrice) return { value: 0, percentage: 0 };
    
    const firstPrice = historicalData[0][1];
    const change = currentPrice - firstPrice;
    const percentage = (change / firstPrice) * 100;
    
    return {
      value: change.toFixed(2),
      percentage: percentage.toFixed(2)
    };
  };
  
  // Get currency symbol
  const getCurrencySymbol = () => {
    switch(selectedCurrency.toLowerCase()) {
      case 'usd': return '$';
      case 'brl': return 'R$';
      case 'gbp': return '£';
      case 'eur': return '€';
      default: return '$';
    }
  };

  const change = calculateChange();

  // Adicionar manipulador de tecla ESC para sair do modo de tela cheia
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && fullscreenChart) {
        setFullscreenChart(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenChart]);

  // Format current date
  const currentDate = format(new Date(), "MMMM dd, yyyy, HH:mm:ss", { locale: enUS });
  
  // Format last exchange rates update time
  const formattedLastUpdate = lastRatesUpdate ? 
    format(new Date(lastRatesUpdate), "MMMM dd, yyyy, HH:mm:ss", { locale: enUS }) : 
    'Never';

  return (
    <div className="crypto-monitor">
      <header className="header">
        <h1>Real-Time Cryptocurrency Monitor</h1>
        <p className="date">{currentDate}</p>
        <p className="exchange-rates-update">Exchange rates last updated: {formattedLastUpdate}</p>
      </header>

      <div className="controls">
        <div className="select-container">
          <label htmlFor="crypto-select">Cryptocurrency:</label>
          <select 
            id="crypto-select"
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
          >
            {cryptoList.map(crypto => (
              <option key={crypto.id} value={crypto.id}>
                {crypto.name} ({crypto.symbol.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="select-container">
          <label htmlFor="currency-select">Currency:</label>
          <select 
            id="currency-select"
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
          >
            <option value="usd">US Dollar (USD)</option>
            <option value="brl">Brazilian Real (BRL)</option>
            <option value="gbp">British Pound (GBP)</option>
            <option value="eur">Euro (EUR)</option>
          </select>
        </div>

        <div className="select-container">
          <label htmlFor="time-range">Period:</label>
          <select 
            id="time-range"
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
          >
            <option value={1}>1 day</option>
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>3 months</option>
            <option value={365}>1 year</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="price-info">
            <div className="current-price">
              <h2>Current Price</h2>
              <p className="price">{getCurrencySymbol()}{currentPrice ? currentPrice.toFixed(2) : '0.00'}</p>
              <p className={`change ${change.value >= 0 ? 'positive' : 'negative'}`}>
                {change.value >= 0 ? '+' : ''}{change.value} {selectedCurrency.toUpperCase()} ({change.value >= 0 ? '+' : ''}{change.percentage}%)
              </p>
            </div>
          </div>

          <div className="charts-container">
            <div className={`chart-card ${fullscreenChart === 'd3' ? 'fullscreen' : ''}`}>
              <h3>D3.js Chart - Historical Analysis</h3>
              <button 
                className="expand-button" 
                onClick={() => setFullscreenChart(fullscreenChart === 'd3' ? null : 'd3')}
              >
                {fullscreenChart === 'd3' ? 'Minimizar' : 'Expandir'}
              </button>
              <div className="chart">
                <D3Chart data={historicalData} crypto={selectedCrypto} currency={selectedCurrency} />
              </div>
            </div>

            <div className={`chart-card ${fullscreenChart === 'recharts' ? 'fullscreen' : ''}`}>
              <h3>Recharts Chart - Price Variation</h3>
              <button 
                className="expand-button" 
                onClick={() => setFullscreenChart(fullscreenChart === 'recharts' ? null : 'recharts')}
              >
                {fullscreenChart === 'recharts' ? 'Minimizar' : 'Expandir'}
              </button>
              <div className="chart">
                <RechartsChart data={historicalData} crypto={selectedCrypto} currency={selectedCurrency} />
              </div>
            </div>

            <div className={`chart-card ${fullscreenChart === 'uplot' ? 'fullscreen' : ''}`}>
              <h3>uPlot Chart - Real-Time</h3>
              <button 
                className="expand-button" 
                onClick={() => setFullscreenChart(fullscreenChart === 'uplot' ? null : 'uplot')}
              >
                {fullscreenChart === 'uplot' ? 'Minimizar' : 'Expandir'}
              </button>
              <div className="chart">
                <UPlotChart data={realtimeData} crypto={selectedCrypto} currency={selectedCurrency} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CryptoMonitor;