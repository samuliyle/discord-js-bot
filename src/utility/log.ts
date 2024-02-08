import {LogLevel} from '../types'

const logMessage = (message: string | unknown, type: LogLevel) => {
  let logMessage = message
  if (message instanceof Error) {
    logMessage = `${message.name}: ${message.message} | stack: ${
      message.stack ?? ''
    }`
  }
  console.log(`[${new Date().toISOString()}] [${type}]: ${logMessage}`)
}

export const logDebug = (message: string | unknown) => {
  logMessage(message, LogLevel.DEBUG)
}

export const logInfo = (message: string | unknown) => {
  logMessage(message, LogLevel.INFO)
}

export const logWarning = (message: string | unknown) => {
  logMessage(message, LogLevel.WARNING)
}

export const logError = (message: string | unknown) => {
  logMessage(message, LogLevel.ERROR)
}
