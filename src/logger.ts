/* eslint no-console: off, class-methods-use-this: off */
export default class Logger {
  warn(message: string,) {
    console.warn(message,);
  }

  error(message: string,) {
    console.error(message,);
  }

  info(message: string,) {
    console.log(message,);
  }
}
