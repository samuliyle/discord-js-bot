const Promise = require('bluebird');

const formatTime = require('../helpers/formattime');

function channelInfo(parameters, message) {
  return Promise.resolve(`**Name**: ${message.channel.name}\n**Id**: ${message.channel.id}\n**Creation date**: ${formatTime(message.channel.createdAt, true)}`);
}

function guildInfo(parameters, message) {
  const guild = message.guild;
  const guildInfo = `**Name**: ${guild.name}\n**Id**: ${guild.id}\n**Creation date**: ${formatTime(guild.createdAt, true)}\n**Region**: ${guild.region}\n**Member count**: ${guild.memberCount}`;
  return Promise.resolve(guildInfo);
}

function userInfo(parameters, message) {
  const author = message.author;
  if (parameters.length !== 0) {
    console.log(message.channel.members);
  }
  let userinfo = `**Name**: ${author.username}\n**Id**: ${author.id}\n**Creation date**: ${formatTime(author.createdAt, true)}`;
  if (author.avatarURL) {
    userinfo += `\n**Avatar**: ${author.avatarURL}`;
  }
  return Promise.resolve(userinfo);
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
};
