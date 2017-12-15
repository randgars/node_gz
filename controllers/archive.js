const fs = require('fs');
const fse = require('fs-extra');
const url = require('url');
const { URLSearchParams } = require('url');

const Archive = require('../models/archive');

const readGZipFile = require('../helpers/readGZipFile');

//delete all archives and clear DB
exports.delete = async ctx => {
  await Archive
    .remove()
    .then(
      () => {
        return fse.emptyDir('./files')
      },
      err => {
        console.log(err);
      })
    .then(
      () => {
        ctx.body = 'done';
      },
      err => {
        console.log(err);
        ctx.response.status = 500;
      }
    )
    .catch(err => {
      console.log('catch err: ', err)
    })
}

//Create new archive and add object in DB
exports.create = async ctx => {
  const file = ctx.request.body.files[""];
  if (file.name.indexOf('.txt.gz') === -1) { // check for file type (only .txt.gz)
    ctx.body = 'Unsupported mimetype. Only \'.txt.gz\' allowed';
    ctx.response.status = 400;
    return null;
  }
  const fields = ctx.request.body.fields;
  if (!fields.title) { // check the presence of a title
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
    .then(
      docs => {
        if (docs.length !== 0) { // check the uniqueness of the title
          return 'A title is exist'
        } else {
          return Archive.find({path: './files/' + file.name})
        }
      },
      err => {
        console.log(err);
        ctx.response.status = 500;
    })
    .then(
      docs => {
        console.log(docs)
        if (Array.isArray(docs) && docs.length !== 0) { // check the uniqueness of the archive
          return 'This archive is exist';
        } 
        if (Array.isArray(docs) && docs.length === 0)  {
          return Archive.create(archive)
        }
        return docs
      },
      err => {
        console.log(err);
        ctx.response.status = 500;
    })
    .then(
      result => {
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

// Get all archives
exports.getAll = async ctx => {
  const myURL = ctx.request.url;
  const query = url.parse(myURL).query; // get query from url
  const params = new URLSearchParams(query); // get params from query
  let fristItem; // index of a start element
  if (params.get('first')) {
    fristItem = +params.get('first') - 1;
  } else {
    fristItem = 0
  }
  const maxItems = +params.get('max'); // amount of elements to display
  await Archive
    .find({})
    .skip(fristItem)
    .limit(maxItems)
    .then(
      items => {
        const resultArray = [];
        items.forEach(item => {
          resultArray.push({
            id: item._id,
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

//Get lines
exports.getArchiveLines = async ctx => {
  const pathname = url.parse(ctx.request.url).pathname;
  const params = pathname.split('/').slice(-2); //get params from url
  const archiveId = params[0];
  const lines = params[1]; //amount of lines to display

  await Archive
    .find({_id: archiveId})
    .then(
      docs => {
        const archive = docs[0];
        return readGZipFile(archive.path)
      },
      err => {
        console.log(err);
        ctx.response.status = 500;
      })
    .then(
      buf => {
        return buf.toString()
      },
      err => {
        console.log(err);
        ctx.response.status = 500;
      })
    .then(
      data => {
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