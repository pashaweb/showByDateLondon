'use strict';

var express = require('express');
var controller = require('./favorite.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/multi/', controller.createMulti);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);

module.exports = router;
//# sourceMappingURL=index.js.map
