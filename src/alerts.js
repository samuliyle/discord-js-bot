const Promise = require('bluebird');
const Logger = require('basic-logger');

const loggerConfig = {
  showTimestamp: true,
};
const log = new Logger(loggerConfig);

let alerts;

function checkAlerts(cmd, client) {
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
            for (const id in channels) {
              let msg = '';
              const obj = channels[id];
              for (let i = 0; i < obj.message.length; i++) {
                msg += `<@${obj.message[i].userId}> `;
              }
              msg += res.message;
              const channel = client.channels.get(id);
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
  }, 300000); // 5 minute 300000
}


function loadAlerts(cmd, client, callback) {
  const cmdReturn = cmd();
  const startTime = new Date().getTime();
  if (cmdReturn instanceof Promise) {
    cmdReturn.then((res) => {
      const executionTime = new Date().getTime() - startTime;
      console.log(`Execution time: ${executionTime}`);
      alerts = res;
      checkAlerts(callback, client);
    })
    .catch((err) => {
      log.error(`Error: ${err}`);
    });
  }
}

module.exports = { loadAlerts };
