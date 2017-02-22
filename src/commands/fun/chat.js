const Cleverbot = require('cleverbot');
const Promise = require('bluebird');

const constants = require('../../../config/constants.js');

const cleverbot = new Cleverbot({
  key: constants.CLEVERBOT
});

function chat(message) {
  if (message.length === 0) return (Promise.resolve('Yes...?'));
  const msg = message.join(' ');
  return new Promise((resolve, reject) => {
    cleverbot.query(msg)
      .then((response) => {
        resolve(response.output);
      });
  });
}

module.exports = {
  mörkö: chat,
  morko: chat,
};
