const mysql = require('mysql');

const constants = require('./config/constants');
const _ = require('lodash');
const emoji = require('node-emoji');

const connection = mysql.createConnection({
  host: constants.DB_URL,
  user: constants.DB_USERNAME,
  password: constants.DB_PASSWORD,
  database: constants.DB,
  charset: 'utf8mb4',
});

connection.connect((err) => {
  if (err) {
    console.log('Error connecting to database.');
    console.log(err.stack);
    return;
  }
  console.log('Connected to database.');
});

function logMessage(msg) {
  connection.query('INSERT INTO messages (message, userId, channelId, username, time) values(?, ?, ?, ?, ?)',
  [msg.content, msg.author.id, msg.channel.id, msg.author.username, new Date()], (err) => {
    if (err) throw err;
  });
}

function logCommand(command, parameters, msg, executionTime, ownCommand) {
  let parameter = null;
  if (parameters.length !== 0) {
    parameter = parameters.join(' ');
  }
  connection.query(
    'INSERT INTO commands (command, parameters, username, user_id, channel_id, guild_id, execution_time, time, own_command) values(?, ?, ?, ?, ?, ?, ?, ?, ?)',
  [command, parameter, msg.author.username, msg.author.id, msg.channel.id, msg.guild.id, executionTime, new Date(), ownCommand], (err) => {
    if (err) throw err;
  }
);
}

function randomName(client) {
  setInterval(() => {
    const count = 1;
    connection.query(`CALL get_rands(${count}, ${constants.BEST_SERVER})`, (err, result) => {
      if (err && result.length === 0) return;
      let name = 'Mörkö';
      result.forEach((q, i) => {
        if (i + 1 === result.length) return;
        if (q[0]) {
          if (q[0].message) {
            const words = q[0].message.split(' ');
            const rand = Math.floor(Math.random() * words.length);
            if (words[rand].length >= 25) {
              name = words[rand].substr(0, 25);
            } else {
              name = words[rand];
            }
          }
        }
      });
      if (name.length === 0) return;
      const firstEmoji = emoji.random();
      const secondEmoji = emoji.random();
      let emojiName = `${firstEmoji.emoji} ${name} ${secondEmoji.emoji}`;
      if (emojiName.length > 32) {
        emojiName = `${firstEmoji.emoji} ${name}`;
        if (emojiName.length > 32) {
          emojiName = name;
        }
      }
      const guild = client.guilds.get(constants.BEST_SERVER);
      if (!_.isNil(guild)) {
        guild.members.get(client.user.id)
        .setNickname(emojiName)
        .then(() => {
          console.log('New name: ' + emojiName);
        })
        .catch((error) => {
          console.log(error);
        });
      }
    });
  }, 3600000); // 60 minutes
}

module.exports = {
  connection,
  logMessage,
  logCommand,
  randomName,
};
