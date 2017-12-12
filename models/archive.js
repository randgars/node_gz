const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const db = require('../db');
// const ObjectID = require('mongodb').ObjectID;

const archiveSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  expire: {
    type: Date
  }
})

module.exports = mongoose.model('Archive', archiveSchema);