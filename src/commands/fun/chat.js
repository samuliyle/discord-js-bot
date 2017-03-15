const Cleverbot = require('cleverbot-node');
const Promise = require('bluebird');

const constants = require('../../../config/constants.js');

const cleverbot = new Cleverbot();
cleverbot.configure({botapi: constants.CLEVERBOT});

function chat(message) {
  if (message.length === 0)
    return (Promise.resolve('Yes...?'));
  const msg = message.join(' ');
  console.log(msg);
  return new Promise((resolve, reject) => {
    cleverbot.write(msg, (response) => {
      console.log(response);
      resolve(response.output);
    });
  });
}

module.exports = {
  mörkö: chat,
  morko: chat
};
