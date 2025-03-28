import axios from 'axios';

// Base axios configuration for CoinGecko API
const api = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
});

// Currency exchange rates (initialized with default values)
let exchangeRates = {
  usd: 1,
  brl: 5.05, // 1 USD = 5.05 BRL
  gbp: 0.78, // 1 USD = 0.78 GBP
  eur: 0.92  // 1 USD = 0.92 EUR
};

// Last update timestamp for exchange rates
let lastExchangeRatesUpdate = 0;

// Function to fetch real-time exchange rates
export const fetchExchangeRates = async () => {
  try {
    // Check if we need to update (no more than once every 10 minutes)
    const now = Date.now();
    if (now - lastExchangeRatesUpdate < 10 * 60 * 1000) {
      return exchangeRates;
    }
    
    // Using Exchange Rate API (free tier)
    const response = await axios.get('https://open.er-api.com/v6/latest/USD');
    
    if (response.data && response.data.rates) {
      // Update exchange rates
      exchangeRates = {
        usd: 1,
        brl: response.data.rates.BRL || exchangeRates.brl,
        gbp: response.data.rates.GBP || exchangeRates.gbp,
        eur: response.data.rates.EUR || exchangeRates.eur
      };
      
      // Update timestamp
      lastExchangeRatesUpdate = now;
      console.log('Exchange rates updated:', exchangeRates);
    }
    
    return exchangeRates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return current rates if there's an error
    return exchangeRates;
  }
};

// Function to convert price from USD to target currency
export const convertCurrency = async (priceInUsd, targetCurrency = 'usd') => {
  // Ensure we have the latest exchange rates
  await fetchExchangeRates();
  const rate = exchangeRates[targetCurrency.toLowerCase()] || 1;
  return priceInUsd * rate;
};

// Function to get the last update time of exchange rates
export const getLastExchangeRateUpdate = () => {
  return lastExchangeRatesUpdate;
};

// Function to get the current price of a cryptocurrency
export const getCurrentPrice = async (cryptoId, currency = 'usd') => {
  try {
    const response = await api.get(`/simple/price`, {
      params: {
        ids: cryptoId,
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
        include_last_updated_at: true,
      },
    });
    return response.data[cryptoId];
  } catch (error) {
    console.error('Error fetching current price:', error);
    
    // If the error is 401 (Unauthorized) or another API error, return simulated data
    if (error.response && (error.response.status === 401 || error.response.status === 429)) {
      console.log('Using simulated current price due to API limitations');
      return {
        usd: 20000 + Math.random() * 30000, // Preço entre $20,000 e $50,000
        usd_24h_change: -5 + Math.random() * 10, // Variação entre -5% e +5%
        usd_market_cap: 1000000000000, // Valor de mercado simulado
        last_updated_at: Math.floor(Date.now() / 1000) // Timestamp atual em segundos
      };
    }
    
    throw error;
  }
};

// Function to generate simulated historical data
const generateMockHistoricalData = (days = 7) => {
  const data = [];
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  const hourInMs = 60 * 60 * 1000;
  
  // Define interval based on days
  const interval = days > 30 ? dayInMs : hourInMs;
  const dataPoints = days > 30 ? days : days * 24;
  
  // Generate initial price between $10,000 and $60,000
  let price = 10000 + Math.random() * 50000;
  
  for (let i = 0; i < dataPoints; i++) {
    // Add random variation to price (-2% to +2%)
    price = price * (0.98 + Math.random() * 0.04);
    
    // Add timestamp and price
    const timestamp = now - (dataPoints - i) * interval;
    data.push([timestamp, price]);
  }
  
  return data;
};

// Function to get historical data for a cryptocurrency
export const getHistoricalData = async (cryptoId, days = 7, currency = 'usd') => {
  try {
    const response = await api.get(`/coins/${cryptoId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: days > 30 ? 'daily' : 'hourly',
      },
    });
    // Convert prices if not USD
    if (currency.toLowerCase() !== 'usd') {
      // Process all conversions in parallel for better performance
      const convertedPrices = await Promise.all(
        response.data.prices.map(async (item) => {
          const convertedPrice = await convertCurrency(item[1], currency);
          return [item[0], convertedPrice];
        })
      );
      return convertedPrices;
    }
    return response.data.prices;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    
    // If the error is 401 (Unauthorized) or another API error, return simulated data
    if (error.response && (error.response.status === 401 || error.response.status === 429)) {
      console.log('Using simulated data due to API limitations');
      const data = generateMockHistoricalData(days);
      // Convert prices if not USD
      if (currency.toLowerCase() !== 'usd') {
        // Process all conversions in parallel for better performance
        const convertedPrices = await Promise.all(
          data.map(async (item) => {
            const convertedPrice = await convertCurrency(item[1], currency);
            return [item[0], convertedPrice];
          })
        );
        return convertedPrices;
      }
      return data;
    }
    
    throw error;
  }
};

// Function to generate simulated cryptocurrency list
const generateMockCryptoList = (limit = 50) => {
  const mockCryptos = [
    { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
    { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
    { id: 'binancecoin', symbol: 'bnb', name: 'Binance Coin' },
    { id: 'cardano', symbol: 'ada', name: 'Cardano' },
    { id: 'solana', symbol: 'sol', name: 'Solana' },
    { id: 'ripple', symbol: 'xrp', name: 'XRP' },
    { id: 'polkadot', symbol: 'dot', name: 'Polkadot' },
    { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin' },
    { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche' },
    { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu' },
    { id: 'matic-network', symbol: 'matic', name: 'Polygon' },
    { id: 'litecoin', symbol: 'ltc', name: 'Litecoin' },
    { id: 'chainlink', symbol: 'link', name: 'Chainlink' },
    { id: 'near', symbol: 'near', name: 'NEAR Protocol' },
    { id: 'tron', symbol: 'trx', name: 'TRON' },
    { id: 'stellar', symbol: 'xlm', name: 'Stellar' },
    { id: 'algorand', symbol: 'algo', name: 'Algorand' },
    { id: 'cosmos', symbol: 'atom', name: 'Cosmos' },
    { id: 'monero', symbol: 'xmr', name: 'Monero' },
    { id: 'tezos', symbol: 'xtz', name: 'Tezos' }
  ];
  
  return mockCryptos.slice(0, limit);
};

// Function to get list of available cryptocurrencies
export const getCryptoList = async (limit = 50) => {
  try {
    const response = await api.get('/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: false,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cryptocurrency list:', error);
    
    // If the error is 401 (Unauthorized) or another API error, return simulated data
    if (error.response && (error.response.status === 401 || error.response.status === 429)) {
      console.log('Using simulated cryptocurrency list due to API limitations');
      return generateMockCryptoList(limit);
    }
    
    throw error;
  }
};

// Function to get real-time data (simulated with polling)
export const setupRealtimeData = (cryptoId, interval = 60000, callback) => {
  // Initial fetch
  getCurrentPrice(cryptoId).then(callback).catch(console.error);
  
  // Configure polling to simulate real-time data
  const intervalId = setInterval(() => {
    getCurrentPrice(cryptoId).then(callback).catch(console.error);
  }, interval);
  
  // Return function to clear the interval
  return () => clearInterval(intervalId);
};