const Promise = require('bluebird');
const chrono = require('chrono-node');
const moment = require('moment');
const _ = require('lodash');
const database = require('../../../database');

function reminder(message, sender) {
  if (message.length === 0) return Promise.resolve('Incorrect format. !remind <minutes> <message>');
  let msg;
  if (message.length === 1) {
    database.connection.query(`CALL get_rands(${1}, ${sender.channel.id})`, (err, result) => {
      if (result == null || result.length === 0 || result[0].length === 0) {
        msg = '';
      } else {
        msg = result[0][0].message;
      }
    });
  } else {
    msg = message.join(' ');
  }
  return new Promise((resolve) => {
    if (!isNaN(message[0])) {
      const time = _.parseInt(message[0]);
      if (time > 10080 || isNaN(time)) return resolve('Maximum time is 7 days (10080 minutes)');
      if (time < 1) return resolve('Time must be at least 1 minute.');
      setTimeout(() => {
        let reminderMsg = '';
        if (message.length === 1) {
          reminderMsg = msg;
        } else {
          reminderMsg = msg.split(' ').slice(1).join(' ');
        }
        sender.reply(`:fire: REMEMBER: ${reminderMsg}! :fire:`);
      }, time * 60000);
      const minuteMsg = time === 1 ? 'minute' : 'minutes';
      return resolve(`Reminding you in ${time} ${minuteMsg}.`);
    }

    const results = chrono.parse(msg);
    if (results.length === 0) return resolve('Error parsing date. Try using format: !remind <minutes> <message>');

    let endTime = moment(results[0].start.date());
    const currentTime = new moment();
    let duration = moment.duration(endTime.diff(currentTime));
    let minutes = Math.round(duration.asMinutes());

    if (minutes < 1) {
      if (results[0].end) {
        endTime = results[0].end.date();
        duration = moment.duration(endTime.diff(currentTime));
        minutes = duration.asMinutes();
      }
      if (minutes < 1) {
        return resolve('Time must be at least 1 minute.');
      }
    }
    if (minutes > 10080) return resolve('Maximum time is 7 days (10080 minutes)');

    setTimeout(() => {
      sender.reply(`:fire: REMEMBER: "${msg}"! :fire:`);
    }, minutes * 60000);
    const minuteMsg = minutes === 1 ? 'minute' : 'minutes';
    return resolve(`Reminding you in ${minutes} ${minuteMsg}.`);
  });
}

module.exports = {
  remind: reminder,
  reminder,
  timer: reminder,
  alarm: reminder,
  alert: reminder
};
