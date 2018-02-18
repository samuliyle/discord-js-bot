/* eslint-disable no-plusplus,consistent-return */
const Promise = require('bluebird');
const https = require('https');
const _ = require('lodash');
const Discord = require('discord.js');

const database = require('../../../database');
const constants = require('../../../config/constants');

const alerts = {};

function modifyAlerts(result) {
  _.forEach(result, (alert) => {
    if (alert.twitchChannel in alerts) {
      const channelAlerts = alerts[alert.twitchChannel].alert;
      _.forEach(channelAlerts, (channelAlert) => {
        if (channelAlert.userId === alert.userId) {
          return true;
        }
      });
      alerts[alert.twitchChannel].alert.push({ userId: alert.userId, channelId: alert.channelId });
    } else {
      alerts[alert.twitchChannel] = { 
        alert: [{ userId: alert.userId, channelId: alert.channelId }], online: true };
    }
  });
}

function findAlert(alert) {
  if (alert.twitchChannel in alerts) {
    for (let i = 0; i < alerts[alert.twitchChannel].alert.length; i++) {
      const a = alerts[alert.twitchChannel].alert[i];
      if (a.userId === alert.userId && a.channelId === alert.channelId) {
        return i;
      }
    }
  }
  return -1;
}

function getAlerts() {
  if (Object.keys(alerts).length !== 0) return;
  return new Promise((resolve, reject) => {
    database.connection.query('SELECT userId, twitchChannel, channelId FROM alerts', (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) return (resolve('No alerts.'));
      modifyAlerts(result);
      resolve(alerts);
    });
  });
}

function channelExists(channel) {
  const options = {
    host: 'api.twitch.tv',
    path: `/kraken/channels/${channel}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.twitchtv.v3+json',
      'Client-ID': `${constants.TWITCH_ID}`,
    },
  };
  return new Promise((resolve, reject) => {
    let channelStatus = '';
    const req = https.request(options, (res) => {
      res.on('data', (data) => {
        channelStatus += data;
      });
    });
    req.on('close', () => {
      const channelResult = JSON.parse(channelStatus);
      resolve(channelResult.status);
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
}

function addAlert(parameters, message) {
  if (parameters.length === 0) return;
  const status = channelExists(parameters[0]);
  if (status instanceof Promise) {
    return new Promise((resolve, reject) => {
      status.then((res) => {
        if (res) {
          if (res === 404) return resolve(`Channel ${parameters[0]} does not exist.`);
          const alertExists = modifyAlerts([{
            userId: message.author.id,
            twitchChannel: parameters[0],
            channelId: message.channel.id,
          }]);
          if (alertExists) return resolve(`You already have a alert for channel ${parameters[0]}.`);
          database.connection.query(
            'INSERT INTO alerts (userId, twitchChannel, channelId) VALUES(?, ?, ?)',
          [message.author.id, parameters[0], message.channel.id], (err) => {
            if (err) return reject(err);
            resolve('Alert added. :ok_hand:');
          }
        );
        } else {
          return resolve(`Cant add channel ${parameters[0]}.`);
        }
      })
      .catch((err) => {
        reject(err);
      });
    });
  }
}

function removeAlert(parameters, message) {
  if (parameters.length === 0) return;
  const index = findAlert(
    { channelId: message.channel.id, twitchChannel: parameters[0], userId: message.author.id });
  return new Promise((resolve, reject) => {
    if (index === -1) return (resolve(`You don't have an alert to channel ${parameters[0]}.`));
    database.connection.query(
      'DELETE FROM alerts WHERE userId = ? AND twitchChannel = ? AND channelId = ?',
      [message.author.id, parameters[0], message.channel.id], (err) => {
        if (err) return reject(err);
        alerts[parameters[0]].alert.splice(index, 1);
        if (alerts[parameters[0]].alert.length === 0) {
          delete alerts[parameters[0]];
        }
        resolve('Removed alert.');
      }
    );
  });
}

function listAlerts(parameters, message) {
  return new Promise((resolve) => {
    let alertResult = '';
    for (const key in alerts) {
      const obj = alerts[key];
      for (let i = 0; i < obj.alert.length; i++) {
        if (obj.alert[i].userId === message.author.id &&
          obj.alert[i].channelId === message.channel.id) {
          alertResult += `${key}, `;
          break;
        }
      }
    }
    if (alertResult.length === 0) return (resolve('You have no alerts in this channel. !addalert <twitchchannel> to add alerts.'));
    resolve(alertResult.substring(0, alertResult.length - 2));
  });
}

function checkAlert(channel) {
  if (channel.length === 0) return;
  const options = {
    host: 'api.twitch.tv',
    path: `/kraken/streams/${channel}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.twitchtv.v3+json',
      'Client-ID': `${constants.TWITCH_ID}`,
    },
  };
  return new Promise((resolve, reject) => {
    let streamStatus = '';
    const req = https.request(options, (res) => {
      res.on('data', (data) => {
        streamStatus += data;
      });
    });
    req.on('close', () => {
      let statusResult;
      try {
        statusResult = JSON.parse(streamStatus);
      } catch (error) {
        return reject(error);
      }
      if (statusResult.stream) {
        if (alerts[channel].online === false) {
          const announcements = {};
          _.forEach(alerts[channel].alert, (alert) => {
            const { channelId, userId } = alert;
            if (channelId in announcements) {
              announcements[channelId].message.push({ userId });
            } else {
              announcements[channelId] = { message: [{ userId }] };
            }
          });
          const embed = new Discord.RichEmbed();
          const { stream } = statusResult;
          embed.setAuthor(stream.channel.display_name, stream.channel.logo);
          embed.addField('Title', stream.channel.status);
          embed.addField('Game', stream.game, true);
          embed.addField('Viewers', stream.viewers, true);
          embed.setURL(stream.channel.url);
          embed.addField('Url', stream.channel.url);
          const { preview } = stream;
          if (!_.isNil(preview) && !_.isNil(preview.medium)) {
            embed.setImage(preview.medium);
          }
          if (!_.isNil(stream.profile_banner_background_color)) {
            embed.setColor(stream.profile_banner_background_color);
          }
          embed.setThumbnail(stream.channel.logo);
          alerts[channel].online = true;
          resolve({ channel: announcements, message: embed, channelName: stream.channel.display_name });
        }
      } else {
        alerts[channel].online = false;
      }
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
}

module.exports = {
  checkalert: checkAlert,
  getalerts: getAlerts,
  addalert: addAlert,
  alerts: listAlerts,
  removealert: removeAlert,
};
