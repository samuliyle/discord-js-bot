const glob = require('glob');
const R = require('ramda');

const globOptions = {
  realpath: true,
  nodir: true,
};

const commandFiles = R.uniq(R.flatten([
  glob.sync(`${__dirname}/**/*.js`, globOptions),
]));

const commands = R.mergeAll(R.map((jsPath) => {
  console.log(jsPath);
  return require(jsPath);
}, commandFiles));

module.exports = commands;
