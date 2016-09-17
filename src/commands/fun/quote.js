const Promise = require('bluebird');

const connection = require('../../../database');
const formatTime = require('../helpers/formattime');

function randomQuote(parameters, message) {
  let count = 1;
  const channel = message.channel;
  if (parameters.length !== 0) {
    if (!isNaN(parameters[0])) {
      count = parameters[0] < 10 ? parameters[0] : 10;
    }
  }
  return new Promise((resolve, reject) => {
    connection.query(`CALL get_rands(${count}, ${channel.id})`, (err, result) => {
      if (err) return reject(err);
      let returnMessage = '';
      result.forEach((q, i) => {
        if (i + 1 === result.length) return;
        const quote = q[0];
        const date = new Date(quote.time);
        returnMessage += `${quote.username}: "${quote.message}" (${formatTime(date, false)})\n`;
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
    connection.query('SELECT username, message, time FROM messages WHERE message LIKE ? and channelId = ?', [finalPhrase, '95592065215246336'], (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) return (resolve(`No messages found containing phrase "${phrase}" in this channel.`));
      const rand = Math.floor(Math.random() * result.length);
      resolve(result[rand].message);
    });
  });
}

function phraseCount(parameters, message) {
  const channel = message.channel;
  if (parameters.length === 0) return
  const phrase = parameters.join(' ');
  const finalPhrase = `%${phrase}%`;
  return new Promise((resolve, reject) => {
    connection.query('SELECT count(*) FROM messages WHERE message LIKE ? and channelId = ?', [finalPhrase, '95592065215246336'], (err, result) => {
      if (err) return reject(err);
      return (resolve(`${result[0]['count(*)']}`));
    });
  });
}

module.exports = {
  quote: randomQuote,
  randomquote: randomQuote,
  phrase: searchPhrase,
  phrasecount: phraseCount,
};
