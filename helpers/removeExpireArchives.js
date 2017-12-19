const cron = require('node-cron');
const fs = require("fs");
const fse = require('fs-extra');

const Archive = require('../models/archive');

// function for removing expire archives
module.exports = cron.schedule('* * */1 * *', async () => {
  try {
    const filteredArchives = await Archive.find().where('expire').lte(new Date());
    if (Array.isArray(filteredArchives) && filteredArchives.length !== 0) {
      filteredArchives.forEach(item => {
        fse.remove(item.path)
          .then(() => {
            console.log('File was removed')
          })
          .catch(err => {
            console.log(err)
          })
      })
      await Archive.remove().where('expire').lte(new Date())
      console.log('done')
    }
  } catch (err) {
    console.error(err)
  }
})