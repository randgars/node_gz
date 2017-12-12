const Router = require('koa-router');
const bodyParser = require('koa-body');
// const body = require('koa-better-body');
var router = require('koa-better-router')().loadMethods()

const archiveController = require('../controllers/archive');

// const router = new Router()

router.post('/api/archives', bodyParser({ multipart: true }), archiveController.create)


module.exports = router;