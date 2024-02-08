import mysql from "mysql";
import secrets from "../config/secrets.json";
import config from "../config/config.json";
import { logDebug, logError, logInfo } from "../utility/log";
import { Message } from "discord.js";
import { QueryCallback } from "../types";
import { randomIntFromInterval } from "../utility/utility";

export let databaseConnectionOk = false;
const pool = mysql.createPool({
  host: config.database.url,
  database: config.database.name,
  user: secrets.database.username,
  password: secrets.database.password,
  charset: "utf8mb4",
});

const testConnection = () => {
  try {
    query("SELECT 1", undefined, (err) => {
      if (err) {
        logError("Disabling database commands, connection failed.");
        logError(err);
        return;
      }
      logInfo("Database connection successful, enabling database commands.");
      databaseConnectionOk = true;
    });
  } catch (error) {
    logError(error);
  }
};

const query = (
  queryString: string,
  args: string[] | undefined,
  callback: QueryCallback
) => {
  pool.getConnection((err, connection) => {
    logDebug(queryString);
    if (err) {
      logError(err);
      return callback(err);
    }

    const callbackFunc: QueryCallback = (err, results) => {
      connection.release();
      if (err) {
        logError(err);
        return callback(err);
      }
      callback(null, results);
    };

    if (args) {
      connection.query(queryString, args, callbackFunc);
    } else {
      connection.query(queryString, callbackFunc);
    }
  });
};

export const getRandomMessage = (count: number, callback: QueryCallback) => {
  query(
    "SELECT max(id) as maxCount from messages;",
    undefined,
    (err, result) => {
      if (err) {
        throw err;
      }
      const rowCount = result[0].maxCount;
      let queryString =
        "SELECT message,username,time FROM messages WHERE id IN (";
      queryString += Array.from({ length: count + 5 }, () =>
        randomIntFromInterval(1, rowCount)
      ).join(",");
      queryString += `) limit ${count}`;
      query(queryString, undefined, callback);
    }
  );
};

export const insertMessage = (msg: Message) => {
  query(
    "INSERT INTO messages (message, userId, channelId, username, time) values(?, ?, ?, ?, NOW())",
    [msg.content, msg.author.id, msg.channel.id, msg.author.username],
    (err) => {
      if (err) {
        logError(err);
      }
    }
  );
};

testConnection();
