enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

const logMessage = (message: unknown, type: LogLevel) => {
  let logMessage = message
  if (message instanceof Error) {
    logMessage = `${message.name}: ${message.message} | stack: ${
      message.stack ?? ''
    }`
  }
  console.log(`[${new Date().toISOString()}] [${type}]: ${logMessage}`)
}

export const logDebug = (message: string) => {
  logMessage(message, LogLevel.DEBUG)
}

export const logInfo = (message: string) => {
  logMessage(message, LogLevel.INFO)
}

export const logWarning = (message: string) => {
  logMessage(message, LogLevel.WARNING)
}

export const logError = (message: string, exception?: unknown) => {
  logMessage(message, LogLevel.ERROR)
  if (exception) {
    logMessage(exception, LogLevel.ERROR)
  }
}
