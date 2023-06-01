

export default class Logger {

   public static error(className: string, error: Error | string) {
      console.log("\x1b[31m\x1b[1m", `${className} Exception:\n`, String(error), "\x1b[0m")
   }
}