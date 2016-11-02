const Discord = require('discord.js');
const Logger = require('basic-logger');
const Promise = require('bluebird');

const constants = require('./config/constants');
const commands = require('./src/commands/index');
const connection = require('./database');

const loggerConfig = {
  showTimestamp: true,
};

let loggedIn = false;

let alerts;

const client = new Discord.Client();
client.login(constants.LOGIN_TOKEN);
const log = new Logger(loggerConfig);

function handleCommand(cmd, parameters, message, commandName) {
  const cmdReturn = cmd(parameters, message);
  const startTime = new Date().getTime();
  console.log(commandName);
  console.log(parameters);
  if (cmdReturn instanceof Promise) {
    cmdReturn.then((res) => {
      const executionTime = new Date().getTime() - startTime;
      console.log(`Execution time: ${executionTime}`);
      if (res) message.channel.sendMessage(res);
      logCommand(commandName, parameters, message, executionTime, 1);
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

function logCommand(command, parameters, msg, executionTime, ownCommand) {
  if (parameters.length === 0) parameters = null;
  connection.query('INSERT INTO commands (command, parameters, username, user_id, channel_id, guild_id, execution_time, time, own_command) values(?, ?, ?, ?, ?, ?, ?, ?, ?)',
  [command, parameters, msg.author.username, msg.author.id, msg.channel.id, msg.guild.id, executionTime, new Date(), ownCommand], (err) => {
    if (err) throw err;
  });
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
  if (typeof(text) === "string") {
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  } else {
    return text;
  }
}

function randomName() {
  setInterval(() => {
    const count = 1;
    connection.query(`CALL get_rands(${count}, ${constants.BEST_SERVER})`, (err, result) => {
      if (err && result.length === 0) return;
      let name = 'Mörkö';
      result.forEach((q, i) => {
        if (i + 1 === result.length) return;
        const words = q[0].message.split(" ");
        const rand = Math.floor(Math.random() * words.length);
        if (words[rand].length >= 31) {
          name = words[rand].substr(0, 31);
        } else {
          name = words[rand];
        }
        return;
      });
      client.guilds.find("id", constants.BEST_SERVER)
      .members.find("id", client.user.id)
      .setNickname(name)
      .then((s) => {
        console.log("Changed name");
      })
      .catch((err) => {
        console.log(err);
      });
    });
  }, 600000); // 10 minutes
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
  log.info('Logged in.');
  if (!loggedIn) {
    loggedIn = true;
    loadAlerts(commands.getalerts);
    randomName();
  }
});

client.on('message', (message) => {
  const msg = message.content;
  if (msg) {
    if (message.author.id === constants.ID || message.author.bot) return;
    if (msg.charAt(0) === '!') {
      const parameters = msg.split(' ');
      const command = parameters[0].substring(1).toLowerCase();
      if (command.length === 0) return;
      let cmd = commands[command];
      if (command === 'eval') cmd = evalCommand;
      if (cmd) {
        handleCommand(cmd, parameters.slice(1), message, command);
      } else {
        logCommand(command, parameters.slice(1), message, null, 0);
      }
    } else {
      logMessage(message);
    }
  }
});

module.exports = evalCommand;
