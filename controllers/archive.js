const Archive = require('../models/archive');
const fs = require("fs");

exports.create = async ctx => {
  const file = ctx.request.body.files[""];
  const fields = ctx.request.body.fields;
  const reader = fs.createReadStream(file.path);
  const stream = fs.createWriteStream('./files/' + file.name);
  reader.pipe(stream);

  const archive = {
    title: file.name,
    description: fields.description,
    expire: new Date(fields.expiration_date)
  };

  await Archive
    .find({title: file.name})
    .then((docs) => {
      if (docs.length !== 0) {
        return 'title exist';
      } else {
        return Archive.create(archive)
      }
    })
    .then((result) => {
      ctx.body = result
    },
    err => {
      console.log(err);
      ctx.response.status = 500;
    })
    .catch(err => {
      console.log('catch err: ', err)
    })
}