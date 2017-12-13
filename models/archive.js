const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const archiveSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  expire: {
    type: Date,
    required: true
  },
  path: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Archive', archiveSchema);