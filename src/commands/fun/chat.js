const Cleverbot = require('cleverbot-node');
const Promise = require('bluebird');

const cleverBot = new Cleverbot();

function chat(message) {
  if (message.length === 0) return (Promise.resolve('Yes...?'));
  const msg = message.join(' ');
  return new Promise((resolve, reject) => {
    Cleverbot.prepare(() => {
      try {
        cleverBot.write(message, (response) => {
          resolve(response.message);
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = {
  mörkö: chat,
  morko: chat,
};
