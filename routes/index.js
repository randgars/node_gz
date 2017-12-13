const bodyParser = require('koa-body');
var router = require('koa-better-router')().loadMethods();

const archiveController = require('../controllers/archive');

router.post('/api/archives', bodyParser({ multipart: true }), archiveController.create)

router.get('/api/archives', archiveController.getAll)

module.exports = router;