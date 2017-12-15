const cron = require('node-cron');
const fs = require("fs");
const fse = require('fs-extra');

const Archive = require('../models/archive');

// function for removing expire archives
module.exports = cron.schedule('* * */1 * *', async () => {
  await Archive
    .find()
    .where('expire')
    .lte(new Date())
    .then(
      docs => {
        if (Array.isArray(docs) && docs.length !== 0) {
          docs.forEach(item => {
            fse.remove(item.path) //remove files from server
              .then(() => {
                console.log('File was removed')
              })
              .catch(err => {
                console.log(err)
              })
          })
          return Archive
            .remove() // remove from DB
            .where('expire')
            .lte(new Date())
        }
      },
      err => {
        console.log(err);
      })
    .then(
      () => {
        console.log('done')
      },
      err => {
        console.log(err);
      })
      .catch(err => {
        console.log('catch err: ', err)
      })
})