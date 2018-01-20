const Promise = require('bluebird');
const database = require('../../../database');
const _ = require('lodash');

const utility = require('../../utility/utility');

function hasOwnPropertyCaseInsensitive(obj, property) {
  const props = [];
  _.forOwn(obj, (value, key) => {
    props.push(key);
  });
  let prop;
  while (prop = props.pop()) {
    if (prop.toLowerCase() === property.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function topUsage(users, count, topUser) {
  const sortable = [];
  let topUsers = '';
  if (topUser) {
    _.forOwn(users, (value, key) => {
      sortable.push([users[key].username, users[key].usageCount]);
    });
  } else {
    _.forOwn(users, (value, key) => {
      sortable.push([key, users[key].usageCount]);
    });
  }
  sortable.sort((a, b) => {
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


function commandInfo(parameters, message) {
  if (parameters.length !== 0) {
    return new Promise((resolve, reject) => {
      database.connection.query('SELECT * from commands where command = ?', parameters[0].toLowerCase(), (err, result) => {
        if (err) return reject(err);
        if (result.length === 0) return (resolve(`No info found on command '${parameters[0]}'`));
        const cmdInfo = {
          usageCount: 0,
          channelCount: 0,
          exeCount: 0,
          parameters: {},
          allUsers: {},
          channelUsers: {},
          executionTimes: {
            avgExecutionTime: 0,
            minExecutionTime: null,
            maxExecutionTime: 0,
            sumExecutionTime: 0,
          },
          firstUsage: null,
          lastUsage: null,
        };
        for (const cmd of result) {
          cmdInfo.usageCount++;
          const { username, time } = cmd;
          const userId = cmd.user_id;
          const exeTime = cmd.execution_time;
          const parameter = cmd.parameters;
          if (exeTime) {
            if (exeTime > 0) {
              if (cmdInfo.executionTimes.maxExecutionTime < exeTime) {
                cmdInfo.executionTimes.maxExecutionTime = exeTime;
              }
              if (cmdInfo.executionTimes.minExecutionTime) {
                if (cmdInfo.executionTimes.minExecutionTime > exeTime) {
                  cmdInfo.executionTimes.minExecutionTime = exeTime;
                }
              } else {
                  cmdInfo.executionTimes.minExecutionTime = exeTime;
              }
              cmdInfo.executionTimes.sumExecutionTime += exeTime;
              cmdInfo.exeCount++;
            }
          }
          if (parameter) {
            const fixedParameter = parameter.toLowerCase();
            if (hasOwnPropertyCaseInsensitive(cmdInfo.parameters, fixedParameter)) {
              cmdInfo.parameters[fixedParameter].usageCount++;
            } else {
              cmdInfo.parameters[fixedParameter] = {
                usageCount: 1
              };
            }
          }
          if (cmd.guild_id === message.guild.id) {
            if (cmdInfo.channelUsers.hasOwnProperty(userId)) {
              cmdInfo.channelUsers[userId].usageCount++;
              cmdInfo.allUsers[userId].username = username;
            } else {
              cmdInfo.channelUsers[userId] = {
                username,
                usageCount: 1
              };
            }
            cmdInfo.channelCount++;
          }
          if (cmdInfo.allUsers.hasOwnProperty(userId)) {
            cmdInfo.allUsers[userId].usageCount++;
            cmdInfo.allUsers[userId].username = username;
          } else {
            cmdInfo.allUsers[userId] = {
              username,
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
Max execution time: **${cmdInfo.executionTimes.maxExecutionTime}**ms`;
        }
        resolve(`Command: **${parameters[0]}**
Usage count: **${cmdInfo.usageCount}**
Channel usage count: **${cmdInfo.channelCount}**
Channel top 3 users: ${topUsage(cmdInfo.channelUsers, 3, true) || ''}
Top 3 parameters: ${topUsage(cmdInfo.parameters, 3) || ''}
${exeTimes || 'Mörkö command: **false**'}
First usage: **${utility.formatTime(cmdInfo.firstUsage, true)}**
Last usage: **${utility.formatTime(cmdInfo.lastUsage, true)}**`);
      });
    });
  }
}


module.exports = {
  command: commandInfo,
  stats: commandInfo,
};
