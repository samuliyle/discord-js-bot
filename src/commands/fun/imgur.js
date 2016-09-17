const Promise = require('bluebird');
const https = require('https');

const constants = require('../../../config/constants');

function randomSubredditImage(subReddit) {
  if (subReddit.length === 0) return;
  const options = {
    host: 'api.imgur.com',
    path: `/3/gallery/r/${subReddit}/top/month/1`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Client-ID ${constants.IMGURID}`,
    },
  };
  return new Promise((resolve, reject) => {
    let images = '';
    const req = https.request(options, (res) => {
      res.on('data', (data) => {
        images += data;
      });
    });
    req.on('close', () => {
      const imageResult = JSON.parse(images);
      if (imageResult.data.length === 0) return (resolve(`${subReddit} subreddit doesnt exist or its inactive.`));
      const rand = Math.floor(Math.random() * imageResult.data.length);
      const image = imageResult.data[rand];
      let imageLink = '';
      if (image.animated && image.type === 'image/gif') {
        imageLink = image.gifv;
      } else if (image.link) {
        imageLink = image.link;
      }
      const title = image.title ? image.title : '';
      resolve(`${imageLink} ${title}`);
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
}

module.exports = {
  imgur: randomSubredditImage,
  subreddit: randomSubredditImage,
};
