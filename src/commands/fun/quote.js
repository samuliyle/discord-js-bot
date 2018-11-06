const Promise = require('bluebird');

const _ = require('lodash');
const database = require('../../../database');
const utility = require('../../utility/utility');

function randomQuote(parameters, message) {
  let count = 1;
  const { channel } = message;
  if (parameters.length !== 0) {
    if (!_.isNaN(parameters[0])) {
      count = parameters[0] < 10 ? parameters[0] : 10;
    }
  }
  return new Promise((resolve, reject) => {
    database.connection.query(`CALL get_rands(${count}, ${channel.id})`, (err, result) => {
      if (err) return reject(err);
      let returnMessage = '';
      if (_.isNil(result)) {
        resolve();
      }
      result.forEach((q, i) => {
        if (i + 1 === result.length) return;
        const quote = q[0];
        if (!_.isNil(quote)) {
          const date = new Date(quote.time);
          returnMessage += `${quote.username}: "${quote.message}" (${utility.formatTime(date, false)})\n`;
        }
      });
      resolve(returnMessage);
    });
  });
}

function searchPhrase(parameters, message) {
  if (parameters.length === 0) return;
  const phrase = parameters.join(' ');
  const finalPhrase = `%${phrase}%`;
  return new Promise((resolve, reject) => {
    database.connection.query('SELECT username, message, time FROM messages WHERE message LIKE ? and channelId = ?', [finalPhrase, message.channel.id], (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) return (resolve(`No messages found containing phrase "${phrase}" in this channel.`));
      const rand = Math.floor(Math.random() * result.length);
      const quote = result[rand];
      const date = new Date(quote.time);
      resolve(`${quote.username}: "${quote.message}" (${utility.formatTime(date, false)})\n`);
    });
  });
}

function phraseCount(parameters, message) {
  if (parameters.length === 0) return;
  const phrase = parameters.join(' ');
  let finalPhrase = `%${phrase}%`;
  if (phrase.indexOf('>') !== -1) {
    finalPhrase = `%${phrase.substring(0, phrase.indexOf('>') - 1)}%`;
  }
  let query = 'SELECT count(*) FROM messages WHERE message LIKE ? and channelId = ?';
  const queryParameters = [finalPhrase, message.channel.id];
  if (parameters.length >= 3) {
    if (parameters[parameters.length - 2] === '>') {
      queryParameters.push(parameters[parameters.length - 1]);
      query += ' and username = ?';
    }
  }
  return new Promise((resolve, reject) => {
    database.connection.query(query, queryParameters, (err, result) => {
      if (err) return reject(err);
      return (resolve(`${result[0]['count(*)']}`));
    });
  });
}

function findOccurance(parameters, message, commandName) {
  if (parameters.length === 0) return;
  let order = 'ASC';
  if (commandName === 'last') order = 'DESC';
  const phrase = parameters.join(' ');
  const finalPhrase = `%${phrase}%`;
  return new Promise((resolve, reject) => {
    database.connection.query(`SELECT username, message, time FROM messages WHERE channelId = ? and message LIKE ? ORDER BY time ${order} LIMIT 1`, [message.channel.id, finalPhrase], (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) return (resolve(`No messages found containing phrase "${phrase}" in this channel.`));
      const date = new Date(result[0].time);
      resolve(`${result[0].username}: "${result[0].message}" (${utility.formatTime(date, false)})\n`);
    });
  });
}

module.exports = {
  quite: randomQuote,
  quit: randomQuote,
  quot: randomQuote,
  quote: randomQuote,
  randomquote: randomQuote,
  phrase: searchPhrase,
  phrasecount: phraseCount,
  last: findOccurance,
  lastphrase: findOccurance,
  first: findOccurance,
  firstphrase: findOccurance,
};
