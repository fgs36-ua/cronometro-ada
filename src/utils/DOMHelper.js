/**
 * DOM manipulation helper utilities
 * Provides common DOM operations with error handling
 */
export class DOMHelper {
  /**
   * Safely get element by ID
   * @param {string} id - Element ID
   * @returns {HTMLElement|null}
   */
  static getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with ID '${id}' not found`);
    }
    return element;
  }

  /**
   * Safely query selector
   * @param {string} selector - CSS selector
   * @param {HTMLElement} context - Context element (default: document)
   * @returns {HTMLElement|null}
   */
  static querySelector(selector, context = document) {
    try {
      return context.querySelector(selector);
    } catch (error) {
      console.error(`Invalid selector '${selector}':`, error);
      return null;
    }
  }

  /**
   * Safely query all selector
   * @param {string} selector - CSS selector
   * @param {HTMLElement} context - Context element (default: document)
   * @returns {NodeList}
   */
  static querySelectorAll(selector, context = document) {
    try {
      return context.querySelectorAll(selector);
    } catch (error) {
      console.error(`Invalid selector '${selector}':`, error);
      return [];
    }
  }

  /**
   * Toggle class on element
   * @param {HTMLElement} element - Target element
   * @param {string} className - Class name to toggle
   * @param {boolean} force - Force add/remove (optional)
   */
  static toggleClass(element, className, force) {
    if (!element) return;
    element.classList.toggle(className, force);
  }

  /**
   * Add event listener with error handling
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options (optional)
   */
  static addEventListener(element, event, handler, options = {}) {
    if (!element) {
      console.warn('Cannot add event listener: element is null');
      return;
    }

    const wrappedHandler = (e) => {
      try {
        handler(e);
      } catch (error) {
        console.error(`Error in event handler for '${event}':`, error);
      }
    };

    element.addEventListener(event, wrappedHandler, options);
    return wrappedHandler; // Return for potential cleanup
  }

  /**
   * Create element with attributes and content
   * @param {string} tagName - Tag name
   * @param {Object} attributes - Element attributes
   * @param {string|HTMLElement|HTMLElement[]} content - Element content
   * @returns {HTMLElement}
   */
  static createElement(tagName, attributes = {}, content = null) {
    const element = document.createElement(tagName);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else {
        element.setAttribute(key, value);
      }
    });

    // Set content
    if (content !== null) {
      if (typeof content === 'string') {
        element.textContent = content;
      } else if (content instanceof HTMLElement) {
        element.appendChild(content);
      } else if (Array.isArray(content)) {
        content.forEach(child => {
          if (child instanceof HTMLElement) {
            element.appendChild(child);
          }
        });
      }
    }

    return element;
  }

  /**
   * Remove all children from element
   * @param {HTMLElement} element - Target element
   */
  static clearChildren(element) {
    if (!element) return;
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  /**
   * Show/hide element
   * @param {HTMLElement} element - Target element
   * @param {boolean} show - Whether to show the element
   */
  static setVisible(element, show) {
    if (!element) return;
    element.style.display = show ? '' : 'none';
  }

  /**
   * Get element position relative to viewport
   * @param {HTMLElement} element - Target element
   * @returns {DOMRect|null}
   */
  static getElementRect(element) {
    if (!element) return null;
    return element.getBoundingClientRect();
  }
}