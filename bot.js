const Discord = require('discord.js');
const Logger = require('basic-logger');
const Promise = require('bluebird');

const constants = require('./config/constants');
const commands = require('./src/commands/index');
const connection = require('./database');

const loggerConfig = {
  showTimestamp: true,
};

let alerts;

const client = new Discord.Client();
client.login(constants.LOGIN_TOKEN);
const log = new Logger(loggerConfig);

function handleCommand(cmd, parameters, message) {
  const cmdReturn = cmd(parameters, message);
  const startTime = new Date().getTime();
  if (cmdReturn instanceof Promise) {
    cmdReturn.then((res) => {
      const executionTime = new Date().getTime() - startTime;
      console.log(`Execution time: ${executionTime}`);
      if (res) message.channel.sendMessage(res);
    })
    .catch((err) => {
      log.error(`Message: ${message.content} Error: ${err}`);
    });
  }
}

function logMessage(msg) {
  connection.query('INSERT INTO messages (message, userId, channelId, username, time) values(?, ?, ?, ?, ?)',
  [msg.content, msg.author.id, msg.channel.id, msg.author.username, new Date()], (err) => {
    if (err) throw err;
  });
}

function loadAlerts(cmd) {
  const cmdReturn = cmd();
  const startTime = new Date().getTime();
  if (cmdReturn instanceof Promise) {
    cmdReturn.then((res) => {
      const executionTime = new Date().getTime() - startTime;
      console.log(`Execution time: ${executionTime}`);
      alerts = res;
      checkAlerts(commands.checkalert);
    })
    .catch((err) => {
      log.error(`Error: ${err}`);
    });
  }
}

function checkAlerts(cmd) {
  setInterval(() => {
    for (const key in alerts) {
      const cmdReturn = cmd(key);
      const startTime = new Date().getTime();
      if (cmdReturn instanceof Promise) {
        cmdReturn.then((res) => {
          const executionTime = new Date().getTime() - startTime;
          console.log(`Execution time: ${executionTime}`);
          if (res) {
            const channels = res.channel;
            for (const key in channels) {
              let msg = '';
              const obj = channels[key];
              for (let i = 0; i < obj.message.length; i++) {
                msg += `<@${obj.message[i].userId}> `
              }
              msg += res.message;
              const channel = client.channels.find('id', key);
              if (channel) {
                channel.sendMessage(msg);
              }
            }
          }
        })
        .catch((err) => {
          log.error(`Error: ${err}`);
        });
      }
    }
  }, 300000); // 5 minutes
}

client.on('ready', () => {
  loadAlerts(commands.getalerts);
  log.info('Logged in.');
});

client.on('message', (message) => {
  const msg = message.content;
  if (msg) {
    if (message.author.id === constants.ID) return;
    if (msg.charAt(0) === '!') {
      const parameters = msg.split(' ');
      const command = parameters[0].substring(1);
      const cmd = commands[command];
      if (cmd) {
        handleCommand(cmd, parameters.slice(1), message);
      }
    } else {
      logMessage(message);
    }
  }
});
