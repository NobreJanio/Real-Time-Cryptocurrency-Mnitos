/**
 * ShortcutButton utility class
 * This class handles the creation and management of shortcut buttons for the charts
 */

class ShortcutButton {
  constructor(options = {}) {
    this.options = {
      text: options.text || 'Shortcut',
      className: options.className || 'shortcut-button',
      onClick: options.onClick || (() => {}),
      container: options.container || document.body
    };
    this.element = null;
  }

  /**
   * Initialize the shortcut button
   * @returns {HTMLElement} The created button element
   */
  init() {
    // Create button element
    this.element = document.createElement('button');
    this.element.className = this.options.className;
    this.element.textContent = this.options.text;
    
    // Add event listener
    this.element.addEventListener('click', this.options.onClick);
    
    // Make sure the container is a valid DOM node before appending
    if (this.options.container && this.options.container.appendChild && typeof this.options.container.appendChild === 'function') {
      this.options.container.appendChild(this.element);
    } else {
      console.error('Invalid container for ShortcutButton. Container must be a valid DOM node.');
    }
    
    return this.element;
  }

  /**
   * Remove the button from the DOM
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }

  /**
   * Update button properties
   * @param {Object} options - New options to apply
   */
  update(options = {}) {
    // Update options
    this.options = { ...this.options, ...options };
    
    // Update element if it exists
    if (this.element) {
      this.element.textContent = this.options.text;
      this.element.className = this.options.className;
      
      // If container changed, move the element
      if (options.container && this.element.parentNode !== options.container) {
        this.element.parentNode.removeChild(this.element);
        
        // Make sure the new container is valid before appending
        if (options.container.appendChild && typeof options.container.appendChild === 'function') {
          options.container.appendChild(this.element);
        } else {
          console.error('Invalid container for ShortcutButton update. Container must be a valid DOM node.');
        }
      }
    }
  }
}

export default ShortcutButton;