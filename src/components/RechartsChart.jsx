import React, { useRef, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import '../utils/index.js'; // Importa as utilidades que incluem ShortcutButton

function RechartsChart({ data, crypto, currency = 'usd' }) {
  const chartRef = useRef(null);
  
  if (!data || data.length === 0) return null;

  // Format data for Recharts
  const formattedData = data.map(item => {
    const date = new Date(item[0]);
    return {
      date: date.toLocaleDateString('pt-BR'),
      price: item[1],
      timestamp: date.getTime() // For sorting
    };
  });

  // Sort by date
  formattedData.sort((a, b) => a.timestamp - b.timestamp);

  // Calculate price change for each day
  for (let i = 1; i < formattedData.length; i++) {
    formattedData[i].change = formattedData[i].price - formattedData[i-1].price;
    formattedData[i].percentChange = (formattedData[i].change / formattedData[i-1].price) * 100;
  }
  formattedData[0].change = 0;
  formattedData[0].percentChange = 0;

  // Get currency symbol
  const getCurrencySymbol = () => {
    switch(currency.toLowerCase()) {
      case 'usd': return '$';
      case 'brl': return 'R$';
      case 'gbp': return '£';
      case 'eur': return '€';
      default: return '$';
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="card" style={{ padding: '10px', margin: 0 }}>
          <p><strong>Data:</strong> {label}</p>
          <p><strong>Preço:</strong> {getCurrencySymbol()}{payload[0].value.toFixed(2)}</p>
          {payload[0].payload.change !== undefined && (
            <>
              <p>
                <strong>Variação:</strong> 
                <span className={payload[0].payload.change >= 0 ? 'positive' : 'negative'}>
                  {payload[0].payload.change >= 0 ? '+' : ''}
                  {getCurrencySymbol()}{payload[0].payload.change.toFixed(2)}
                </span>
              </p>
              <p>
                <strong>Variação %:</strong> 
                <span className={payload[0].payload.percentChange >= 0 ? 'positive' : 'negative'}>
                  {payload[0].payload.percentChange >= 0 ? '+' : ''}
                  {payload[0].payload.percentChange.toFixed(2)}%
                </span>
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // Adiciona um listener para o evento de reset de zoom
  useEffect(() => {
    const chartContainer = chartRef.current;
    if (chartContainer) {
      const handleResetZoom = (event) => {
        // Implementação do reset de zoom para Recharts
        console.log('Reset zoom on Recharts chart');
      };
      
      chartContainer.addEventListener('chart:reset-zoom', handleResetZoom);
      
      return () => {
        chartContainer.removeEventListener('chart:reset-zoom', handleResetZoom);
      };
    }
  }, []);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="date" />
        <YAxis 
          domain={['auto', 'auto']}
          tickFormatter={(value) => `${getCurrencySymbol()}${value.toFixed(2)}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="price" 
          name={`${crypto.toUpperCase()} Preço`}
          stroke="#8884d8" 
          fill="#8884d8" 
          fillOpacity={0.3} 
          activeDot={{ r: 8 }} 
        />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RechartsChart;