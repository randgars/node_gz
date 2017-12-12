const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const state = {
  db: null
};

exports.connect = function (url, done) {
  if (state.db) {
    return done();
  }

  mongoose.connect(url, {
    useMongoClient: true,
  })
    .then(db => {
      state.db = db;
      done();
    },
    err => {
      done(err)
    })
    .catch(err => {
      console.log(err)
    })
}

exports.get = function () {
  return state.db;
}