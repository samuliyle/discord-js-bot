const _ = require('lodash');
const Promise = require('bluebird');
const parse = require('parse-color');

function randomColor(parameters, message) {
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
                            message.channel.send(`Set color to http://garden.offbeatwit.ch/color/${colorHex.replace('#', '')}`);
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
                    message.channel.send(`Set color to http://garden.offbeatwit.ch/color/${colorHex.replace('#', '')}`);
                    return Promise.resolve();
                })
                .catch((e) => {
                    Promise.reject(e);
                });
        }
    }
    Promise.resolve();
}

module.exports = {
    color: randomColor,
    randomColor
};
