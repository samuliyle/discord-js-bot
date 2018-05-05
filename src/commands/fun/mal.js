const popura = require('popura');
const Discord = require('discord.js');
const Promise = require('bluebird');
const _ = require('lodash');
const constants = require('../../../config/constants');

const malClient = popura(constants.MAL_USERNAME, constants.MAL_PASSWORD);

const pageCount = 25;

function animeEmbed(anime) {
    const embed = new Discord.RichEmbed();
    const {
        id,
        title,
        english,
        episodes,
        score,
        status,
        start_date,
        end_date,
        image,
        type,
        synopsis
    } = anime;
    let fullTitle = title;
    if (!_.isEmpty(english) && title !== english) {
        fullTitle += ` (${english})`;
    }
    embed.setAuthor(fullTitle, image);
    const syns = synopsis.match(/^(.*?)[.?!]\s/);
    let syn = `${synopsis.substring(0, 75)}...`;
    if (!_.isEmpty(syns)) {
        syn = _.head(syns);
    }
    if (!_.isEmpty(syn)) {
        embed.addField('Synopsis', syn);
    }
    if (!_.isNil(score)) {
        embed.addField('⭐Score', score, true);
    }
    if (!_.isNil(episodes)) {
        embed.addField('Episodes', episodes, true);
    }
    if (!_.isEmpty(type)) {
        embed.addField('Type', type, true);
    }
    if (!_.isEmpty(status)) {
        embed.addField('Status', status, true);
    }
    if (!_.isNil(start_date) && start_date !== '0000-00-00') {
        embed.addField('Start date', start_date, true);
    }
    if (!_.isNil(end_date) && end_date !== '0000-00-00') {
        embed.addField('End date', end_date, true);
    }
    if (!_.isNil(image)) {
        embed.setThumbnail(image);
    }
    embed.addField('Url', `https://myanimelist.net/anime/${id}`);
    return embed;
}

function malSearch(searchPhrase, message) {
    if (_.isEmpty(searchPhrase)) {
        return;
    }
    return new Promise((resolve, reject) => {
        // Catch MAL wrapper library errors...
        try {
            malClient
                .searchAnimes(searchPhrase)
                .then((res) => {
                    if (_.isNil(res) || _.isEmpty(res)) {
                        resolve('No animes found');
                    } else if (res.length === 1) {
                        const embed = animeEmbed(_.head(res));
                        message
                            .channel
                            .send({embed});
                        resolve();
                    } else {
                        res = res.slice(0, 50);
                        let msg = `Found ${res.length} results.`;
                        const pages = Math.ceil(res.length / pageCount);
                        if (res.length > pageCount) {
                            msg += ` Showing first ${pageCount}.\n`;
                        } else {
                            msg += '\n';
                        }
                        _.forEach(res, (value, index) => {
                            if (index === pageCount) {
                                return false;
                            }
                            msg += `${index + 1}: ${value.title}\n`;
                        });
                        msg += 'Type the number you would like to select';
                        if (res.length > pageCount) {
                            msg += ' or react to show more.';
                        } else {
                            msg += '.';
                        }
                        message
                            .channel
                            .sendCode('markdown', msg)
                            .then((listMessage) => {
                                let moreMessage = null;
                                let responseOk = false;
                                if (pages > 1) {
                                    listMessage
                                        .react('➕')
                                        .then(() => {
                                            const filter = (reaction, user) => reaction.emoji.name === '➕' && user.id === message.author.id;
                                            const reactionCollector = listMessage.createReactionCollector(filter, {time: 45000});
                                            reactionCollector.on('collect', () => {
                                                const pageCountNew = pageCount * 25;
                                                let newMsg = '';
                                                _.forEach(res.slice(pageCount), (value, index) => {
                                                    const newIndex = index + pageCount;
                                                    if (newIndex === pageCountNew) {
                                                        return false;
                                                    }
                                                    newMsg += `${newIndex + 1}: ${value.title}\n`;
                                                });
                                                message
                                                    .channel
                                                    .sendCode('markdown', newMsg)
                                                    .then((newMessage) => {
                                                        moreMessage = newMessage;
                                                        reactionCollector.stop();
                                                    })
                                                    .catch((err) => {
                                                        reactionCollector.stop();
                                                        reject(err);
                                                    });
                                            });
                                        })
                                        .catch(err => reject(err));
                                }
                                const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 45000});
                                collector.on('end', (collected) => {
                                    if (!_.isNil(moreMessage)) {
                                        moreMessage
                                            .delete()
                                            .catch(err => reject(err));
                                    }
                                    if (_.isEmpty(collected) || !responseOk) {
                                        listMessage
                                            .delete()
                                            .catch(err => reject(err));
                                        message
                                            .delete()
                                            .catch(err => reject(err));
                                    }
                                });
                                collector.on('collect', (response) => {
                                    if (response.content === 'clear') {
                                        response
                                            .delete()
                                            .catch(err => reject(err));
                                        collector.stop();
                                    } else {
                                        const index = parseInt(response.content, 10);
                                        if (index == null || isNaN(index) || index === 0 || index > res.length) {
                                            // message.channel.sendMessage('Invalid index');
                                        } else {
                                            const anime = _.nth(res, index - 1);
                                            if (!_.isNil(moreMessage)) {
                                                moreMessage
                                                    .delete()
                                                    .catch(err => reject(err));
                                            }
                                            response
                                                .delete()
                                                .then(() => {
                                                    responseOk = true;
                                                    const embed = animeEmbed(anime);
                                                    listMessage.edit(embed);
                                                    listMessage.clearReactions();
                                                    collector.stop();
                                                })
                                                .catch((err) => {
                                                    collector.stop();
                                                    reject(err);
                                                });
                                        }
                                    }
                                });
                            });
                        resolve();
                    }
                })
                .catch(err => reject(err));
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    mal: malSearch,
    anime: malSearch,
    malsearch: malSearch,
    animesearch: malSearch
};
