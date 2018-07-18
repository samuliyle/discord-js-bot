const Discord = require('discord.js');
const Promise = require('bluebird');
const _ = require('lodash');
const Typo = require('typo-js');

const dictionary = new Typo('en_US');

const alerts = require('./src/alerts');
const constants = require('./config/constants');
const commands = require('./src/commands/index');

const database = require('./database');

const logger = require('./src/utility/utility');

let loggedIn = false;
const randomName = _.nth(process.argv, 2) === '-r';

const client = new Discord.Client();
client.login(constants.LOGIN_TOKEN);

function handleCommand(cmd, parameters, message, commandName) {
  const cmdReturn = cmd(parameters, message, commandName);
  const startTime = new Date().getTime();
  if (cmdReturn instanceof Promise) {
    cmdReturn.then((res) => {
      const executionTime = new Date().getTime() - startTime;
      logger.logMessage(`Execution time: ${executionTime}`, 'info');
      if (typeof res === 'object' && res.constructor.name === 'RichEmbed') {
        message
          .channel
          .send(res);
      } else if (typeof res === 'object') {
        message
          .channel
          .sendCode('markdown', res.message);
      } else if (res) {
        message
          .channel
          .sendMessage(res);
      }
      database.logCommand(commandName, parameters, message, executionTime, 1);
    }).catch((err) => {
      logger.logMessage(`Message: ${message.content} Error: ${err}`, 'error');
    });
  }
}

function clean(text) {
  if (typeof text === 'string') {
    return text
    /* eslint prefer-template: "off" */
      .replace(/`/g, '`' + String.fromCharCode(8203))
      .replace(/@/g, `@ + ${String.fromCharCode(8203)}`);
  }
  return text;
}

function evalCommand(parameters, message) {
  if (message.author.id !== constants.MASTER || parameters.length === 0) {
    return Promise.resolve();
  }
  try {
    const code = parameters.join(' ');
    let evaled = eval(code);
    if (typeof evaled !== 'string') {
      /* eslint global-require: "off" */
      evaled = require('util').inspect(evaled);
    }
    return Promise.resolve(clean(evaled));
  } catch (err) {
    return Promise.resolve(`${err.name}: ${err.message}`);
  }
}

client.on('ready', () => {
  logger.logMessage('Logged in.', 'info');
  if (!loggedIn) {
    loggedIn = true;
    alerts.loadAlerts(commands.getalerts, client, commands.checkalert);
    if (randomName) {
      logger.logMessage('Random name enabled...', 'info');
      database.randomName(client);
    }
  }
});

client.on('message', (message) => {
  let msg = message.content;
  if (msg) {
    // Ignore bots
    if (message.author.bot) {
      return;
    }
    if (_.startsWith(msg, '!')) {
      if (_.startsWith(msg, '! ') && msg.length > 2) {
        msg = _.trim(msg);
        msg = msg.slice(0, 1) + msg.slice(2);
      }
      const parameters = _.split(msg, ' ');
      const command = parameters[0]
        .substring(1)
        .toLowerCase();
      if (command.length === 0) {
        return;
      }
      let cmd = commands[command];
      if (command === 'eval') {
        cmd = evalCommand;
      }
      if (_.isNil(cmd)) {
        const suggested = dictionary.suggest(command);
        if (!_.isEmpty(suggested)) {
          _.forEach(suggested, (value) => {
            cmd = _.get(commands, value);
            if (!_.isNil(cmd)) {
              return false;
            }
          });
        }
      }
      if (cmd) {
        handleCommand(cmd, parameters.slice(1), message, command);
      } else {
        database.logCommand(command, parameters.slice(1), message, null, 0);
      }
    } else {
      database.logMessage(message);
    }
  }
});

module.exports = evalCommand;
