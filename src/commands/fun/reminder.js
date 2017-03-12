const Promise = require('bluebird');
const chrono = require('chrono-node');
const moment = require('moment');

function reminder(message, sender) {
  if (message.length === 0 || message.length === 1) return Promise.resolve('Incorrect format. !remind <minutes> <message>');
  const msg = message.join(' ');
  return new Promise((resolve, reject) => {
    if (!isNaN(message[0])) {
      const time = parseInt(message[0]);
      if (time > 10080) return resolve('Maximum time is 7 days (10080 minutes)');
      if (time < 1) return resolve('Time must be at least 1 minute.');
      setTimeout(() => {
        sender.reply(`:fire: REMEMBER: ${message.slice(1)}! :fire:`);
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
        return resolve('Time must be at least 1 minute.')
      }
    };
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
  reminder: reminder,
  timer: reminder,
  alarm: reminder,
  alert: reminder
};
