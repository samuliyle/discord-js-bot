const _ = require('lodash');
const Promise = require('bluebird');
const parse = require('parse-color');

const colorLoops = [];

function randomColor(parameters, message, print = true) {
    const { author, member } = message;
    if (!_.isNil(author) && !_.isNil(member)) {
        let colorHex = '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6); 
        if (_.size(parameters) !== 0) {
            const parsedColor = parse(_.head(parameters));
            if (!_.isNil(parsedColor.hex)) {
                colorHex = parsedColor.hex;
            }
        }
        if (!member.colorRole) {
            const roleName = `#${message.author.username}`;
            message
                .guild
                .createRole({
                    name: roleName,
                    color: colorHex,
                    hoist: false,
                    permissions: 1177930945,
                    mentionable: false
                })
                .then((r) => {
                    message
                        .member
                        .addRole(r)
                        .then(() => {
                            if (print) {
                                message.channel.send(`Set color to http://garden.offbeatwit.ch/color/${colorHex.replace('#', '')}`);
                            }
                            return Promise.resolve();
                        });
                })
                .catch((e) => {
                    Promise.reject(e);
                });
        } else {
            message
                .member
                .colorRole
                .edit({
                    color: colorHex
                })
                .then(() => {
                    if (print) {
                        message.channel.send(`Set color to http://garden.offbeatwit.ch/color/${colorHex.replace('#', '')}`);
                    }
                    return Promise.resolve();
                })
                .catch((e) => {
                    Promise.reject(e);
                });
        }
    }
    Promise.resolve();
}

function colorLoop(parameters, message) {
    const exists = _.find(colorLoops, (a) => {
        return message.author.id === a.message.author.id && message.guild.id === a.message.guild.id;
    });
    if (!_.isNil(exists)) {
        clearInterval(exists.interval);
        const index = colorLoops.indexOf(exists);
        if (index !== -1) {
            colorLoops.splice(index, 1);
        }
        return Promise.resolve('Color loop stopped');
    }
    let time = 3600000; // Hour
    if (_.size(parameters) !== 0) {
        const parsedTime = _.parseInt(parameters[0]);
        if (!_.isNaN(parsedTime) && parsedTime >= 1 && parsedTime < 10080) {
            time = parsedTime * 60000;
        }
    }
    randomColor([], message, false);
    const loop = setInterval(() => {
        randomColor([], message, false);
    }, time);
    colorLoops.push({
        message,
        interval: loop
    });
    return Promise.resolve(`Color loop started. Changing your color every ${time / 60000} minutes.`);
}

module.exports = {
    color: randomColor,
    randomColor,
    colorloop: colorLoop
};
