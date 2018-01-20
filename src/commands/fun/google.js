const Promise = require('bluebird');
const https = require('https');
const _ = require('lodash');

const constants = require('../../../config/constants');

function randomGoogleImage(searchPhrase) {
  if (searchPhrase.length === 0) {
    return;
  }
  const offset = _.random(15);
  const options = {
    host: 'www.googleapis.com',
    path: `/customsearch/v1?q=${searchPhrase.join('%20')}&searchType=image&cx=${constants.GOOGLE_CX}&num=1&start=${offset}&imgsize=medium&key=${constants.GOOGLE_ID}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return new Promise((resolve, reject) => {
    let images = '';
    const req = https.request(options, (res) => {
      res.on('data', (data) => {
        images += data;
      });
    });
    req.on('close', () => {
      try {
        const imageResult = JSON.parse(images);
        if (imageResult == null || imageResult.items.length === 0 || !_.has(imageResult.items[0], 'link') || imageResult.items[0].link == null || imageResult.items[0].link === '') {
          return (resolve('Couldnt find any images. :thinking:'));
        }
        const image = imageResult.items[0];
        resolve(`${image.link} ${image.title}`);
      } catch (error) {
        return (resolve('Something went wrong :thinking: Probably daily API limit reached...'));
      }
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
}

module.exports = {
  google: randomGoogleImage
};
