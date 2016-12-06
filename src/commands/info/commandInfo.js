const Promise = require('bluebird');
const connection = require('../../../database');

const formatTime = require('../helpers/formattime');

function commandsInfo(message) {
  return;
  return new Promise((resolve, reject) => {
    connection.query('SELECT * from commands where guild_id = ?', message.guild.id, (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) return (resolve(`No commands used in this channel :thinking:`));
      resolve(result.length);
      // Own commands
      // Top commands
      // users
    });
  });
}

function commandInfo(parameters, message) {
  if (parameters.length === 0) {
    return commandsInfo(message);
  } else {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * from commands where command = ?', parameters[0], (err, result) => {
        if (err) return reject(err);
        if (result.length === 0) return (resolve(`No info found on command '${parameters[0]}'`));
        let cmdInfo = {
          usageCount: 0,
          exeCount: 0,
          parameters: {},
          allUsers: {},
          channelUsers: {},
          executionTimes: {
            avgExecutionTime: 0,
            minExecutionTime: 0,
            maxExecutionTime: 0,
            sumExecutionTime: 0,
          },
          firstUsage: null,
          lastUsage: null,
        };
        for (cmd of result) {
          cmdInfo.usageCount++;
          const username = cmd.username;
          const exeTime = cmd.execution_time;
          const time = cmd.time;
          const parameter = cmd.parameters;
          if (exeTime) {
            if (cmdInfo.executionTimes.maxExecutionTime < exeTime) {
              cmdInfo.executionTimes.maxExecutionTime = exeTime;
            }
            if (cmdInfo.executionTimes.minExecutionTime > exeTime) {
              cmdInfo.executionTimes.minExecutionTime = cmd.minExecutionTime;
            }
            cmdInfo.executionTimes.sumExecutionTime += exeTime;
            cmdInfo.exeCount++;
          }
          if (parameter) {
            if (cmdInfo.parameters.hasOwnProperty(parameter)) {
              cmdInfo.parameters[parameter].usageCount++;
            } else {
              cmdInfo.parameters[parameter] = {
                usageCount: 1
              };
            }
          }
          if (cmd.guild_id === message.guild.id) {
            if (cmdInfo.channelUsers.hasOwnProperty(username)) {
              cmdInfo.channelUsers[username].usageCount++;
            } else {
              cmdInfo.channelUsers[username] = {
                usageCount: 1
              };
            }
          }
          if (cmdInfo.allUsers.hasOwnProperty(username)) {
            cmdInfo.allUsers[username].usageCount++;
          } else {
            cmdInfo.allUsers[username] = {
              usageCount: 1
            };
          }
          if (cmdInfo.firstUsage === null || cmdInfo.firstUsage > time) {
            cmdInfo.firstUsage = time;
          }
          if (cmdInfo.lastUsage < time) {
            cmdInfo.lastUsage = time;
          }
        }
        if (cmdInfo.exeCount !== 0) {
          cmdInfo.executionTimes.avgExecutionTime = cmdInfo.executionTimes.sumExecutionTime / cmdInfo.exeCount;
        }
        let exeTimes;
        if (cmdInfo.executionTimes.avgExecutionTime !== 0) {
          exeTimes =
`Avg execution time: **${cmdInfo.executionTimes.avgExecutionTime}**ms
Min execution time: **${cmdInfo.executionTimes.minExecutionTime}**ms
Max execution time: **${cmdInfo.executionTimes.maxExecutionTime}**ms`
        }
        topUsage(cmdInfo.allUsers);
        resolve(
`Command: **${parameters[0]}**
Usage count: **${cmdInfo.usageCount}**
Channel usage count: **${cmdInfo.usageCount}**
Top 3 users: ${topUsage(cmdInfo.allUsers, 3) || ''}
Channel top 3 users: ${topUsage(cmdInfo.channelUsers, 3) || ''}
Top 3 parameters: ${topUsage(cmdInfo.parameters, 3) || ''}
${exeTimes || 'Mörkö command: **false**'}
First usage: **${formatTime(cmdInfo.firstUsage, true)}**
Last usage: **${formatTime(cmdInfo.lastUsage, true)}**`
        );
      });
    });
  }
}

function topUsage(users, count) {
  let sortable = [];
  let topUsers = "";
  for (const user in users) {
    sortable.push([user, users[user].usageCount])
  }
  sortable.sort(function(a, b) {
      return b[1] - a[1];
  });
  let slicedSortable = sortable;
  if (sortable.length > count) {
    slicedSortable = sortable.slice(0, count);
  }
  for (let i = 0; i < slicedSortable.length; i++) {
    topUsers += `**${i + 1}. ${slicedSortable[i][0]}** (${slicedSortable[i][1]})`;
    if (i + 1 !== slicedSortable.length) {
      topUsers += ' ';
    }
  }
  return topUsers;
}

module.exports = {
  command: commandInfo,
  stats: commandInfo,
};
