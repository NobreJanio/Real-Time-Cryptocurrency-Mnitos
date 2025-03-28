/**
 * Feature Script for Chart Controls
 * This script handles additional features for the cryptocurrency charts
 */

import ShortcutButton from './ShortcutButton';

// Store references to created buttons
const buttons = [];

/**
 * Initialize chart controls
 * @param {Object} options - Configuration options
 */
const init = (options = {}) => {
  // Clean up any existing buttons
  cleanup();
  
  // Get chart containers
  const chartContainers = document.querySelectorAll('.chart-card');
  
  if (!chartContainers || chartContainers.length === 0) {
    console.warn('No chart containers found for feature initialization');
    return;
  }
  
  // Add shortcut buttons to each chart
  chartContainers.forEach((container, index) => {
    // Find the chart element within the container
    const chartElement = container.querySelector('.chart');
    
    if (!chartElement) {
      console.warn(`Chart element not found in container ${index}`);
      return;
    }
    
    // Create zoom reset button
    const resetButton = new ShortcutButton({
      text: 'Reset Zoom',
      className: 'chart-shortcut-button reset-zoom',
      onClick: () => {
        // Dispatch a custom event that chart components can listen for
        const resetEvent = new CustomEvent('chart:reset-zoom', {
          bubbles: true,
          detail: { chartIndex: index }
        });
        chartElement.dispatchEvent(resetEvent);
      },
      container: chartElement // Make sure this is a valid DOM node
    });
    
    // Initialize the button and store reference
    try {
      const buttonElement = resetButton.init();
      buttons.push(resetButton);
    } catch (error) {
      console.error('Error initializing chart shortcut button:', error);
    }
  });
};

/**
 * Clean up all created buttons
 */
const cleanup = () => {
  // Destroy all buttons and clear the array
  buttons.forEach(button => button.destroy());
  buttons.length = 0;
};

/**
 * Update button configurations
 * @param {Object} options - New configuration options
 */
const updateButtons = (options = {}) => {
  buttons.forEach(button => button.update(options));
};

export default {
  init,
  cleanup,
  updateButtons
};