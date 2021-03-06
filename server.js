const Koa = require('koa');
const fse = require('fs-extra');
const logger = require('koa-morgan');
const cors = require('koa2-cors');
const config = require('./config');
const db = require('./db');
const routes = require('./routes');
const removeExpireArchives = require('./helpers/removeExpireArchives');

const app = new Koa();

fse.ensureDir('./files')
.then(() => {
  console.log('Folder was created!')
})
.catch(err => {
  console.error(err)
})

app.use(logger('tiny'));
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type'],
}));


db.connect('mongodb://localhost:27017/archives', (err) => {
  if (err) {
    return console.log(err)
  }
  app.use(routes.middleware())

  const server = app.listen(config.server.port, () => {
    console.log('Server operating and listening on port', server.address().port, '...');
  })
})