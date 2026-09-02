/**
 * A lightweight logger to help with debugging.
 */
export class Logger {
  static debugMode = true;

  static formatTime() {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
  }

  static log(...args) {
    if (this.debugMode) {
      console.log(this.formatTime(), ...args);
    }
  }

  static info(...args) {
    console.info(this.formatTime(), ...args);
  }

  static warn(...args) {
    console.warn(this.formatTime(), ...args);
  }

  static error(...args) {
    console.error(this.formatTime(), ...args);
  }
}
