const Archive = require('../models/archive');
const fs = require("fs");

const url = require('url');
const { URLSearchParams } = require('url');

const readGZipFile = require('../helpers/readGZipFile');

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
    },
    err => {
      console.log(err);
      ctx.response.status = 500;
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
  const query = url.parse(myURL).query;
  const params = new URLSearchParams(query);
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

exports.getArchiveLines = async ctx => {
  const pathname = url.parse(ctx.request.url).pathname;
  const params = pathname.split('/').slice(-2);
  const archiveTitle = params[0];
  const lines = params[1];

  await Archive
    .find({title: archiveTitle})
    .then((docs) => {
      const archive = docs[0];
      return readGZipFile(archive.path)
    },
    err => {
      console.log(err);
      ctx.response.status = 500;
    })
    .then(buf => {
      return buf.toString()
    })
    .then(data => {
      const linesArray = data.split('\n');
      const filteredLines = linesArray.splice(0, lines).map(item => {
        return item.replace(/\r/g, '')
      })
      ctx.body = {
        lines: filteredLines
      }
    })
    .catch(err => {
      console.log('catch err: ', err)
    })
}