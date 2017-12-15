const bodyParser = require('koa-body');
var router = require('koa-better-router')().loadMethods();

const archiveController = require('../controllers/archive');

router.delete('/api/archives', archiveController.delete)

router.post('/api/archives', bodyParser({ multipart: true }), archiveController.create)

router.get('/api/archives', archiveController.getAll)

router.get('/api/archives/:id/:lines', archiveController.getArchiveLines)

module.exports = router;