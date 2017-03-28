const Promise = require('bluebird');
const _ = require('lodash');

function uptime() {
  let message = 'Uptime: ';
  const totalSeconds = process.uptime();
  const days = Math.floor((totalSeconds % 31536000) / 86400);
  const hours = _.parseInt(totalSeconds / 3600) % 24;
  const minutes = _.parseInt(totalSeconds / 60) % 60;
  const seconds = Math.floor(totalSeconds % 60);
  message += days >= 1 ? `${days}d ` : '';
  message += hours < 10 ? `0${hours}:` : `${hours}:`;
  message += minutes < 10 ? `0${minutes}:` : `${minutes}:`;
  message += seconds < 10 ? `0${seconds}` : `${seconds}`;
  return Promise.resolve(message);
}

module.exports = {
  uptime,
};
