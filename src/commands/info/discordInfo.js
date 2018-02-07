const Promise = require('bluebird');
const moment = require('moment-timezone');
const Discord = require('discord.js');
const _ = require('lodash');

const utility = require('../../utility/utility');

function channelInfo(parameters, message) {
  const embed = new Discord.RichEmbed();
  embed.addField('Name', message.channel.name);
  embed.addField('Id', message.channel.id);
  embed.addField('Creation date', utility.formatTime(message.channel.createdAt, true));
  return Promise.resolve(embed);
}

function guildInfo(parameters, message) {
  const {guild} = message;
  const embed = new Discord.RichEmbed();
  embed.addField('Name', guild.name);
  embed.addField('Id', guild.id);
  embed.addField('Creation date', utility.formatTime(guild.createdAt, true));
  embed.addField('Region', guild.region);
  embed.addField('Member count', guild.memberCount);
  if (!_.isNil(guild.iconURL)) {
    embed.setImage(guild.iconURL);
  }
  return Promise.resolve(embed);
}

function userInfo(parameters, message) {
  let {author, member} = message;
  let userInfoText = '';
  if (parameters.length !== 0) {
    author = message
      .guild
      .members
      .find('nickname', parameters[0]);
    if (author === null) {
      author = message
        .guild
        .members
        .find('username', parameters[0]);
      if (author === null) {
        let id = parameters[0];
        if (parameters[0].startsWith('<@!')) {
          id = parameters[0].substring(3, parameters[0].length - 1);
        } else if (parameters[0].startsWith('<@')) {
          id = parameters[0].substring(2, parameters[0].length - 1);
        }
        author = message
          .guild
          .members
          .get(id);
      }
    }
  }
  if (author) {
    let userName = '';
    const embed = new Discord.RichEmbed();
    if (_.size(parameters) !== 0) {
      userName = `${author.user.username}#${author.user.discriminator} (${author.nickname})`;
      embed.addField('Id', author.id);
      embed.addField('Join date', utility.formatTime(author.joinedAt, true));
      embed.addField('Creation date', utility.formatTime(author.user.createdAt, true));
    } else {
      userName = `${author.username}#${author.discriminator}`;
      embed.addField('Id', author.id);
      embed.addField('Creation date', utility.formatTime(author.createdAt, true));
    }
    if (author.avatarURL || author.user.avatarURL) {
      embed.setAuthor(userName, author.avatarURL || author.user.avatarURL);
      embed.setImage(author.avatarURL || author.user.avatarURL);
    } else {
      embed.setAuthor(userName);
    }

    if (!_.isNil(member) && !_.isNil(member.colorRole) && !_.isNil(member.colorRole.hexColor)) {
      embed.setColor(member.colorRole.hexColor);
    }
    return Promise.resolve(embed);
  }
  userInfoText = `Could not find user '${parameters[0]}' in this channel. :thinking: Might not be cached, try using a mention.`;
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
  ville,
  ville2,
  nz,
  fi,
  time
};
