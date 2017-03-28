const Discord = require('discord.js');
const Logger = require('basic-logger');
const Promise = require('bluebird');

const alerts = require('./src/alerts');
const constants = require('./config/constants');
const commands = require('./src/commands/index');

const database = require('./database');

const loggerConfig = {
  showTimestamp: true,
};

let loggedIn = false;

const client = new Discord.Client();
client.login(constants.LOGIN_TOKEN);
const log = new Logger(loggerConfig);

function handleCommand(cmd, parameters, message, commandName) {
  const cmdReturn = cmd(parameters, message, commandName);
  const startTime = new Date().getTime();
  if (cmdReturn instanceof Promise) {
    cmdReturn.then((res) => {
      const executionTime = new Date().getTime() - startTime;
      console.log(`Execution time: ${executionTime}`);
      if (typeof res === 'object') {
        message.channel.sendCode('markdown', res.message);
      } else if (res) {
        message.channel.sendMessage(res);
      }
      database.logCommand(commandName, parameters, message, executionTime, 1);
    })
    .catch((err) => {
      log.error(`Message: ${message.content} Error: ${err}`);
    });
  }
}

function evalCommand(parameters, message) {
  if (message.author.id !== constants.MASTER || parameters.length === 0) return Promise.resolve();
  try {
    const code = parameters.join(" ");
    let evaled = eval(code);
    if (typeof evaled !== "string") {
      evaled = require("util").inspect(evaled);
    }
    return Promise.resolve(clean(evaled))
  } catch(err) {
    return Promise.resolve(err.name + ': ' + err.message);
  }
}

function clean(text) {
  if (typeof text === "string") {
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  } else {
    return text;
  }
}

client.on('ready', () => {
  log.info('Logged in.');
  if (!loggedIn) {
    loggedIn = true;
    alerts.loadAlerts(commands.getalerts, client, commands.checkalert);
    database.randomName(client);
  }
});

client.on('message', (message) => {
  const msg = message.content;
  if (msg) {
    if (message.author.bot) return;
    if (msg.charAt(0) === '!') {
      const parameters = msg.split(' ');
      const command = parameters[0].substring(1).toLowerCase();
      if (command.length === 0) return;
      let cmd = commands[command];
      if (command === 'eval') cmd = evalCommand;
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
