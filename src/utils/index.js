/**
 * Utils index file
 * This file exports all utility functions and initializes features
 */

import ShortcutButton from './ShortcutButton';
import featureScript from './featureScript';

// Object to hold utility functions
const Utils = {
  ShortcutButton,
  featureScript,
  
  /**
   * Initialize all features
   */
  init() {
    // Initialize feature script with default options
    try {
      this.featureScript.init();
    } catch (error) {
      console.error('Error initializing features:', error);
    }
    
    // Add window resize handler for responsive features
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Initialize any other utilities here
  },
  
  /**
   * Handle window resize events
   */
  handleResize() {
    // Update feature buttons on resize
    this.featureScript.updateButtons();
  },
  
  /**
   * Clean up all features
   */
  cleanup() {
    // Clean up feature script
    this.featureScript.cleanup();
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
};

export default Utils;

// Auto-initialize on import if in browser environment
if (typeof window !== 'undefined') {
  // Delay initialization to ensure DOM is fully loaded
  window.addEventListener('DOMContentLoaded', () => {
    Utils.init();
  });
}