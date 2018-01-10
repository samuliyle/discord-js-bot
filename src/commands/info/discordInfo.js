const Promise = require('bluebird');
const https = require('https');
const moment = require('moment-timezone');

const constants = require('../../../config/constants');
const formatTime = require('../helpers/formattime');

function channelInfo(parameters, message) {
  return Promise.resolve(`**Name**: ${message.channel.name}\n**Id**: ${message.channel.id}\n**Creation date**: ${formatTime(message.channel.createdAt, true)}`);
}

function guildInfo(parameters, message) {
  const guild = message.guild;
  const guildInfoText = `**Name**: ${guild.name}\n**Id**: ${guild.id}\n**Creation date**: ${formatTime(guild.createdAt, true)}\n**Region**: ${guild.region}\n**Member count**: ${guild.memberCount}`;
  return Promise.resolve(guildInfoText);
}

function userInfo(parameters, message) {
  let author = message.author;
  let userInfoText = '';
  if (parameters.length !== 0) {
    author = message.guild.members.find('nickname', parameters[0]);
    if (author === null) {
      author = message.guild.members.find('username', parameters[0]);
      if (author === null) {
        let id = parameters[0];
        if (parameters[0].startsWith('<@!')) {
          id = parameters[0].substring(3, parameters[0].length - 1);
        } else if (parameters[0].startsWith('<@')) {
          id = parameters[0].substring(2, parameters[0].length - 1);
        }
        author = message.guild.members.get(id);
      }
    }
  }
  if (author) {
    if (parameters.length !== 0) {
      userInfoText = `**Username**: ${author.user.username}\n**Nickname**: ${author.nickname}\n**Id**: ${author.id}\n**Join date:**: ${formatTime(author.joinedAt, true)}\n**Creation date**: ${formatTime(author.user.createdAt, true)}`;
    } else {
      userInfoText = `**Name**: ${author.username}\n**Id**: ${author.id}\n**Creation date**: ${formatTime(author.createdAt, true)}`;
    }
    if (author.avatarURL || author.user.avatarURL) {
      userInfoText += `\n**Avatar**: ${author.avatarURL || author.user.avatarURL}`;
    }
  } else {
    userInfoText = `Could not find user '${parameters[0]}' in this channel. :thinking: Might not be cached, try using a mention.`;
  }
  return Promise.resolve(userInfoText);
}

function ville() {
  return Promise.resolve('https://i.imgur.com/fxYrmgQ.png');
}

function ville2() {
  return Promise.resolve('http://i.imgur.com/Yc0syYv.png');
}

function nz() {
  return Promise.resolve(`:flag_nz: ${moment().tz('Pacific/Auckland').format('YYYY-MM-DD HH:mm')}`);
}

function fi() {
  return Promise.resolve(`:flag_fi: ${moment().tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm')}`);
}

function time() {
  return Promise.resolve(`:flag_fi: ${moment().tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm')}\n:flag_nz: ${moment().tz('Pacific/Auckland').format('YYYY-MM-DD HH:mm')}`);
}

function commands() {
  return Promise.resolve('Commands: https://github.com/wraithyz/discord-js-bot');
}

function botInfo() {
  return Promise.resolve('Made by **Wraithy**.\n**GitHub:** https://github.com/wraithyz/discord-js-bot');
}

module.exports = {
  channelinfo: channelInfo,
  userinfo: userInfo,
  guildinfo: guildInfo,
  info: botInfo,
  bot: botInfo,
  commands,
  help: commands,
  ville: ville,
  ville2: ville2,
  nz: nz,
  fi: fi,
  time: time
};
