const Archive = require('../models/archive');
const fs = require("fs");

const { URL, URLSearchParams } = require('url');

exports.create = async ctx => {
  const file = ctx.request.body.files[""];
  const fields = ctx.request.body.fields;
  if (!fields.title) {
    ctx.body = 'A title is required'
    ctx.response.status = 400;
    return null;
  }
  const reader = fs.createReadStream(file.path);
  const stream = fs.createWriteStream('./files/' + file.name);
  reader.pipe(stream);

  const archive = {
    title: fields.title,
    description: fields.description,
    expire: new Date(fields.expiration_date),
    path: './files/' + file.name
  };

  await Archive
    .find({title: fields.title})
    .then((docs) => {
      if (docs.length !== 0) {
        return 'A title is exist';
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

exports.getAll = async ctx => {
  const myURL = ctx.request.url;
  const index = myURL.indexOf('?');
  const params = new URLSearchParams(myURL.slice(index+1));
  let fristItem;
  if (params.get('first')) {
    fristItem = +params.get('first') - 1;
  } else {
    fristItem = 0
  }
  const maxItems = +params.get('max');
  await Archive
    .find({})
    .skip(fristItem)
    .limit(maxItems)
    .then(items => {
      const resultArray = [];
      items.forEach(item => {
        resultArray.push({
          title: item.title,
          description: item.description,
          expire: item.expire
        })
      });
      ctx.body = {
        archives: resultArray
      }
    },
    err => {
      console.log(err);
      ctx.response.status = 500;
    })
    .catch(err => {
      console.log('catch err: ', err)
    })
}