const Promise = require('bluebird');
let alerts;

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
            for (const key in channels) {
              let msg = '';
              const obj = channels[key];
              for (let i = 0; i < obj.message.length; i++) {
                msg += `<@${obj.message[i].userId}> `
              }
              msg += res.message;
              const channel = client.channels.get(key);
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

module.exports = {loadAlerts};
