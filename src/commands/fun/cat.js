const Promise = require('bluebird');
const http = require('http');

function randomCat() {
  const options = {
    host: 'random.cat',
    path: '/meow',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  return new Promise((resolve, reject) => {
    let cat = '';
    const req = http.request(options, (res) => {
      res.on('data', (data) => {
        cat += data;
      });
    });
    req.on('close', () => {
      const catResult = JSON.parse(cat);
      if (catResult.length === 0) return (resolve('Trouble getting caterinos. API down?'));
      resolve(catResult.file);
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
}

module.exports = {
  cat: randomCat,
};
