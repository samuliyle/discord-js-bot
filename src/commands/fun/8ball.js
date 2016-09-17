const Promise = require('bluebird');

const answers = require('../../data/eightBall');

function eightBall(question) {
  if (question.length === 0) return Promise.resolve('Might wanna ask a question...');
  const rand = Math.floor(Math.random() * answers.length);
  return Promise.resolve(answers[rand]);
}

module.exports = {
  '8ball': eightBall,
};
