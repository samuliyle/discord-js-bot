const Promise = require('bluebird');

const formatTime = require('../helpers/formattime');
const connection = require('../../../database');

function channelInfo(parameters, message) {
  return Promise.resolve(`**Name**: ${message.channel.name}\n**Id**: ${message.channel.id}\n**Creation date**: ${formatTime(message.channel.createdAt, true)}`);
}

function guildInfo(parameters, message) {
  const guild = message.guild;
  const guildInfo = `**Name**: ${guild.name}\n**Id**: ${guild.id}\n**Creation date**: ${formatTime(guild.createdAt, true)}\n**Region**: ${guild.region}\n**Member count**: ${guild.memberCount}`;
  return Promise.resolve(guildInfo);
}

function userInfo(parameters, message) {
  let author = message.author;
  let userinfo = "";
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
        author = message.guild.members.find('id', id);
      }
    }
  }
  if (author) {
    if (parameters.length !== 0) {
      userinfo = `**Username**: ${author.user.username}\n**Nickname**: ${author.nickname}\n**Id**: ${author.id}\n**Join date:**: ${formatTime(author.joinedAt, true)}\n**Creation date**: ${formatTime(author.user.createdAt, true)}`;
    } else {
      userinfo = `**Name**: ${author.username}\n**Id**: ${author.id}\n**Creation date**: ${formatTime(author.createdAt, true)}`;
    }
    if (author.avatarURL || author.user.avatarURL) {
      userinfo += `\n**Avatar**: ${author.avatarURL || author.user.avatarURL}`;
    }
  } else {
    userinfo = `Could not find user '${parameters[0]}' in this channel. :thinking: Might not be cached, try using a mention.`;
  }
  return Promise.resolve(userinfo);
}

function commands() {
  return Promise.resolve(`Commands: https://github.com/wraithyz/discord-js-bot`);
}

function botInfo() {
  return Promise.resolve(`Made by **Wraithy**.\n**GitHub:** https://github.com/wraithyz/discord-js-bot`);
}

module.exports = {
  channelinfo: channelInfo,
  userinfo: userInfo,
  guildinfo: guildInfo,
  info: botInfo,
  bot: botInfo,
  commands: commands,
  help: commands
};
