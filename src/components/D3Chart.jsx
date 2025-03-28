import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import '../utils/index.js'; // Importa as utilidades que incluem ShortcutButton

function D3Chart({ data, crypto, currency = 'usd' }) {
  const svgRef = useRef();
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Format data
    const formattedData = data.map(item => {
      return {
        date: new Date(item[0]),
        price: item[1]
      };
    }).sort((a, b) => a.date - b.date);

    // Set dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set scales
    const x = d3.scaleTime()
      .domain(d3.extent(formattedData, d => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(formattedData, d => d.price) * 1.1])
      .range([height, 0]);

    // Create line
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.price))
      .curve(d3.curveMonotoneX);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%d/%m')))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

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

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `${getCurrencySymbol()}${d.toFixed(2)}`))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(`Price (${currency.toUpperCase()})`);

    // Add the line path
    svg.append('path')
      .datum(formattedData)
      .attr('fill', 'none')
      .attr('stroke', '#2196F3')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add gradient area under the line
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'd3-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#2196F3')
      .attr('stop-opacity', 0.8);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#2196F3')
      .attr('stop-opacity', 0.1);

    // Add area under the line
    const area = d3.area()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.price))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(formattedData)
      .attr('fill', 'url(#d3-gradient)')
      .attr('d', area);

    // Remove any existing tooltip to avoid duplication
    if (tooltipRef.current) {
      tooltipRef.current.remove();
      tooltipRef.current = null;
    }

    // Check if a tooltip already exists in the DOM to avoid duplication
    let tooltip;
    const existingTooltip = document.querySelector('.d3-tooltip');
    
    if (existingTooltip) {
      // Use the existing tooltip
      tooltip = d3.select(existingTooltip);
    } else {
      // Create a new tooltip
      tooltip = d3.select('body')
        .append('div')
        .attr('class', 'd3-tooltip')
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', '1px solid #ddd')
        .style('border-radius', '4px')
        .style('padding', '10px')
        .style('box-shadow', '0 2px 5px rgba(0,0,0,0.1)')
        .style('opacity', 0);
    }

    // Store reference to the tooltip for later cleanup
    tooltipRef.current = tooltip.node();

    // Add dots for data points with hover effect
    svg.selectAll('.dot')
      .data(formattedData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.price))
      .attr('r', 3)
      .attr('fill', '#2196F3')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 6);

        tooltip.transition()
          .duration(100)
          .style('opacity', 0.9);

        const formatDate = d3.timeFormat('%d/%m/%Y');
        tooltip.html(`<strong>Date:</strong> ${formatDate(d.date)}<br/><strong>Price:</strong> ${getCurrencySymbol()}${d.price.toFixed(2)}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('r', 3);

        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      });

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 0 - (margin.top / 2))
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text(`${crypto.toUpperCase()} - Price History`);

    // Cleanup function
    return () => {
      // Remove the tooltip when the component is unmounted
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, [data, crypto]);

  return (
    <div className="d3-chart-container" style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} width="100%" height="100%"></svg>
    </div>
  );
}

export default D3Chart;