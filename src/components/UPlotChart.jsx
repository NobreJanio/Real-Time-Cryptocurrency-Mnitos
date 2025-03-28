import React, { useEffect, useRef } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import '../utils/index.js'; // Importa as utilidades que incluem ShortcutButton

function UPlotChart({ data, crypto, currency = 'usd' }) {
  const chartRef = useRef();
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Format data for uPlot
    const timestamps = [];
    const prices = [];

    data.forEach(item => {
      timestamps.push(item[0] / 1000); // uPlot expects timestamps in seconds
      prices.push(item[1]);
    });

    // Sort data by timestamp
    const sortedIndices = timestamps.map((_, i) => i).sort((a, b) => timestamps[a] - timestamps[b]);
    const sortedTimestamps = sortedIndices.map(i => timestamps[i]);
    const sortedPrices = sortedIndices.map(i => prices[i]);

    // Prepare data for uPlot
    const uPlotData = [sortedTimestamps, sortedPrices];

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

    // Define options
    const options = {
      title: `${crypto.toUpperCase()} - Real-Time`,
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
      cursor: {
        show: true,
        points: {
          show: true,
          size: 5,
        },
        drag: {
          setScale: true,
        },
      },
      legend: {
        show: true,
      },
      tooltip: {
        show: true,
      },
      axes: [
        {
          scale: 'x',
          label: 'Time',
          labelSize: 14,
          grid: {
            show: true,
            stroke: '#eee',
            width: 1,
          },
          ticks: {
            show: true,
            stroke: '#eee',
            width: 1,
          },
          timeZone: 'local',
          values: (self, ticks) => ticks.map(tick => {
            const date = new Date(tick * 1000);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          }),
        },
        {
          scale: 'y',
          label: `Price (${currency.toUpperCase()})`,
          labelSize: 14,
          grid: {
            show: true,
            stroke: '#eee',
            width: 1,
          },
          values: (self, ticks) => ticks.map(tick => `${getCurrencySymbol()}${tick.toFixed(2)}`),
        },
      ],
      scales: {
        x: {
          time: true,
        },
        y: {
          auto: true,
        },
      },
      series: [
        {
          label: 'Time',
          value: '{YYYY}-{MM}-{DD} {HH}:{mm}:{ss}',
        },
        {
          label: `${crypto.toUpperCase()} Price`,
          stroke: '#FF6384',
          width: 2,
          fill: 'rgba(255, 99, 132, 0.2)',
          value: (self, rawValue) => `${getCurrencySymbol()}${rawValue.toFixed(2)}`,
          points: {
            show: true,
          },
        },
      ],
    };

    // Cleanup previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    chartInstance.current = new uPlot(options, uPlotData, chartRef.current);

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data, crypto]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.setSize({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="uplot-chart-container" style={{ width: '100%', height: '100%' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
}

export default UPlotChart;