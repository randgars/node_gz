const fs = require('fs');
const zlib = require('zlib');
const fse = require('fs-extra');
const url = require('url');
const { URLSearchParams } = require('url');

const Archive = require('../models/archive');

//delete all archives and clear DB
exports.delete = async ctx => {
  try {
    await Archive.remove()
    await fse.emptyDir('./files')
    ctx.body = 'done';
  } catch (err) {
    console.error(err)
  }
}

//Create new archive and add object in DB
exports.create = async ctx => {
  const file = ctx.request.body.files[""];
  if (file.name.indexOf('.txt.gz') === -1) {
    ctx.body = 'Unsupported mimetype. Only \'.txt.gz\' allowed';
    ctx.response.status = 400;
    return null;
  }
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
  try {
    const getArchives = await Archive.find({title: fields.title});
    let createArchive;
    if (getArchives.length !== 0) {
      ctx.body = 'A title is exist';
      ctx.response.status = 400;
      return;
    }
    const filteredArchives = await Archive.find({path: './files/' + file.name})
    if (Array.isArray(filteredArchives) && filteredArchives.length !== 0) {
      ctx.body = 'This archive is exist';
      ctx.response.status = 400;
      return;
    } 
    if (Array.isArray(filteredArchives) && filteredArchives.length === 0)  {
      createArchive = await Archive.create(archive)
      ctx.body = createArchive
    }
  } catch(err) {
    console.error(err)
  }
}

// Get all archives
exports.getAll = async ctx => {
  const myURL = ctx.request.url;
  const query = url.parse(myURL).query;
  const params = new URLSearchParams(query);
  let fristItem;
  if (params.get('first')) {
    fristItem = +params.get('first') - 1;
  } else {
    fristItem = 0
  }
  const maxItems = +params.get('max');
  
  try {
    const getAllArchives =  await Archive.find({}).skip(fristItem).limit(maxItems)
    const resultArray = [];
    getAllArchives.forEach(item => {
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
  } catch (err) {
    console.error(err)
  }
}

//Get lines
exports.getArchiveLines = async ctx => {
  const pathname = url.parse(ctx.request.url).pathname;
  const params = pathname.split('/').slice(-2);
  const archiveId = params[0];
  const lines = params[1];
  try {
    const getAllArchives = await Archive.find({_id: archiveId})
    const filename = fs.readFileSync(getAllArchives[0].path);
    const zlibFile = zlib.gunzipSync(filename).toString()
    const linesArray = zlibFile.split('\n');
    const filteredLines = linesArray.splice(0, lines).map(item => item.replace(/\r/g, ''))
    ctx.body = {
      lines: filteredLines
    }
  } catch (err) {
    console.error(err)
  }
}