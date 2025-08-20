/**
 * Time formatting utilities
 * Handles time display formatting consistently across the application
 */
export class TimeFormatter {
  /**
   * Format time in seconds to MM:SS format
   * @param {number} seconds - Time in seconds (can be negative)
   * @returns {string} Formatted time string
   */
  static formatTime(seconds) {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const minutes = Math.floor(absSeconds / 60);
    const remainingSeconds = Math.floor(absSeconds % 60);
    
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    return isNegative ? `-${formattedTime}` : formattedTime;
  }

  /**
   * Parse time string (MM:SS) to seconds
   * @param {string} timeString - Time string in MM:SS format
   * @returns {number} Time in seconds
   */
  static parseTime(timeString) {
    const isNegative = timeString.startsWith('-');
    const cleanTime = timeString.replace('-', '');
    const [minutes, seconds] = cleanTime.split(':').map(Number);
    
    if (isNaN(minutes) || isNaN(seconds)) {
      throw new Error('Invalid time format');
    }
    
    const totalSeconds = minutes * 60 + seconds;
    return isNegative ? -totalSeconds : totalSeconds;
  }

  /**
   * Format time for progress tooltip display
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time for tooltip
   */
  static formatTooltipTime(seconds) {
    return this.formatTime(Math.round(seconds));
  }

  /**
   * Get human-readable duration description
   * @param {number} seconds - Duration in seconds
   * @returns {string} Human-readable description
   */
  static getDurationDescription(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`;
    }
    
    if (remainingSeconds === 0) {
      return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    }
    
    return `${minutes} minuto${minutes !== 1 ? 's' : ''} y ${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`;
  }
}