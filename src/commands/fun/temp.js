const sensor = require('ds18b20-raspi');
const Promise = require('bluebird');

function temp() {
  return new Promise((resolve, reject) => {
    sensor.readSimpleC((err, temperature) => {
        if (err) {
            reject(err);
        } else {
            resolve(`${temperature} C`);
        }
    });
  });
}

module.exports = {
    temp,
};
