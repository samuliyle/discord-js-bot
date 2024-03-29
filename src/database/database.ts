import mysql from 'mysql'
import {logDebug, logError, logInfo, logWarning} from '../utility/log'
import {Message} from 'discord.js'
import {QueryCallback} from '../types'
import {randomIntFromInterval} from '../utility/utility'

let databaseConnectionOk = false
const pool = mysql.createPool({
  host: process.env.DATABASE_URL,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  charset: 'utf8mb4'
})

const testConnection = () => {
  try {
    query('SELECT 1', undefined, err => {
      if (err) {
        logWarning('Disabling database commands, connection failed')
        return
      }
      logInfo('Database connection successful, enabling database commands.')
      databaseConnectionOk = true
    })
  } catch (error) {
    logError('SQL test connection failed', error)
  }
}

const query = (
  queryString: string,
  args: string[] | undefined,
  callback: QueryCallback
) => {
  pool.getConnection((err, connection) => {
    logDebug(queryString)
    if (err) {
      return callback(err)
    }

    const callbackFunc: QueryCallback = (err, results) => {
      connection.release()
      if (err) {
        logError('SQL ERROR', err)
        return callback(err)
      }
      callback(null, results)
    }

    if (args) {
      connection.query(queryString, args, callbackFunc)
    } else {
      connection.query(queryString, callbackFunc)
    }
  })
}

export const getRandomMessage = (count: number, callback: QueryCallback) => {
  query(
    'SELECT max(id) as maxCount from messages;',
    undefined,
    (err, result) => {
      if (err) {
        throw err
      }
      const rowCount = result[0].maxCount
      let queryString =
        'SELECT message,username,time FROM messages WHERE id IN ('
      queryString += Array.from({length: count + 5}, () =>
        randomIntFromInterval(1, rowCount)
      ).join(',')
      queryString += `) limit ${count}`
      query(queryString, undefined, callback)
    }
  )
}

export const insertMessage = (msg: Message) => {
  query(
    'INSERT INTO messages (message, userId, channelId, username, time) values(?, ?, ?, ?, NOW())',
    [msg.content, msg.author.id, msg.channel.id, msg.author.username],
    err => {
      if (err) {
        logError('Failed to insert new message', err)
      }
    }
  )
}

export const isDatabaseConnected = () => {
  return databaseConnectionOk
}

testConnection()
