import { DebateTimerApp } from './DebateTimerApp.js';

/**
 * Main entry point for the Debate Timer application
 * Initializes the application when DOM is ready
 */

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create and start the application
  window.debateTimerApp = new DebateTimerApp();
  
  console.log('🎯 Debate Timer App initialized with modular architecture');
  console.log('📋 SOLID principles implemented:');
  console.log('   ✅ Single Responsibility - Each class has one purpose');
  console.log('   ✅ Open/Closed - New formats can be added without modification');
  console.log('   ✅ Interface Segregation - Small, focused interfaces');
  console.log('   ✅ Dependency Inversion - Components communicate via abstractions');
  console.log('🎨 Design patterns used:');
  console.log('   ✅ Observer - EventEmitter for component communication');
  console.log('   ✅ Strategy - Different debate formats');
  console.log('   ✅ Service - Configuration, theme, keyboard management');
});

// Handle page unload cleanup
window.addEventListener('beforeunload', () => {
  if (window.debateTimerApp) {
    window.debateTimerApp.destroy();
  }
});

// Export for potential external use
export { DebateTimerApp };