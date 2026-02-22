import eventBus from '../core/EventBus.js';

/**
 * Component — base class for UI components.
 *
 * Lifecycle: constructor → mount → bindEvents → (update)* → destroy
 */
class Component {
  /**
   * @param {HTMLElement|string} container - DOM element or CSS selector
   */
  constructor(container) {
    this.container =
      typeof container === 'string'
        ? document.querySelector(container)
        : container;
    /** @type {Function[]} unsub callbacks */
    this._unsubs = [];
  }

  /**
   * Subscribe to EventBus and track for automatic cleanup.
   */
  listen(event, callback) {
    const unsub = eventBus.on(event, callback);
    this._unsubs.push(unsub);
    return unsub;
  }

  /** Override in subclass — return HTML string. */
  render() {
    return '';
  }

  /** Insert rendered content into the container. */
  mount() {
    if (this.container) {
      this.container.innerHTML = this.render();
    }
    this.bindEvents();
  }

  /** Override — bind DOM event listeners after mount. */
  bindEvents() {}

  /** Override — update DOM with new data. */
  update(data) {} // eslint-disable-line no-unused-vars

  /** Clean up EventBus subscriptions and DOM. */
  destroy() {
    this._unsubs.forEach((fn) => fn());
    this._unsubs = [];
    if (this.container) this.container.innerHTML = '';
  }
}

export default Component;
