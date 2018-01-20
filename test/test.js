const expect = require('chai').expect;
const mysql = require('mysql');

const constants = require('../config/constants');

const eightBall = require('../src/commands/fun/8ball');
const google = require('../src/commands/fun/google');
const cat = require('../src/commands/fun/cat');
const chat = require('../src/commands/fun/chat');
const imgur = require('../src/commands/fun/imgur');

describe('Access to DB', function(){
   describe('connect', function(){
        it('should connect to DB', function(done){
            var connection = mysql.createConnection({
              host: constants.DB_URL,
              user: constants.DB_USERNAME,
              password: constants.DB_PASSWORD,
              database: constants.DB,
              charset: 'utf8mb4'
            });
            connection.connect(done);
        });
    })
});

describe('eightBall', function() {
  const answers = require('../src/data/eightball');
  it('should complain about lack of question', function() {
    return eightBall['8ball']([])
      .then(function (data) {
        expect(data).to.be.a('string');
        expect(data).to.equal('Might wanna ask a question...');
      });
  });
  it('should return an answer', function() {
    return eightBall['8ball'](['test'])
      .then(function (data) {
        expect(data).to.be.a('string');
        expect(answers).to.include(data);
      });
  })
});

describe('randomGoogleImage', function() {
  it('should return nothing', function() {
    var googleReturn = google['google']([]);
    expect(googleReturn).to.not.exist;
  });
  it('should return a image link', function() {
    return google['google'](['test'])
      .then(function (data) {
        expect(data).to.be.a('string');
      });
  })
});

describe('randomCat', function() {
  it('should return a image link', function() {
    return cat['cat'](['test'])
      .then(function (data) {
        expect(data).to.be.a('string');
        expect(data).to.not.equal('Trouble getting caterinos. API down?');
        expect(data).to.not.be.empty;
      });
  })
});

describe('chat', function() {
  it('should return an answer to a empty question', function() {
    return chat['mörkö']([])
      .then(function (data) {
        expect(data).to.be.a('string');
        expect(data).to.equal('Yes...?');
      });
  });
  it('should return an answer using cleverbot', function() {
    return chat['mörkö'](['test'])
      .then(function (data) {
        expect(data).to.be.a('string');
        expect(data).to.not.be.empty;
        expect(data).to.not.be.equal('<html>');
      });
  })
});

describe('randomSubredditImage', function() {
  it('should complain about the lack of subreddit', function() {
    return imgur['imgur']([])
      .then(function (data) {
        expect(data).to.be.a('string');
        expect(data).to.equal('Include a subreddit.');
      });
  });
  it('should return a imgur image link and a title', function() {
    return imgur['imgur'](['aww'])
      .then(function (data) {
        expect(data).to.be.a('string');
        expect(data).to.not.contain('subreddit doesnt exist or its inactive.');
      });
  })
});
