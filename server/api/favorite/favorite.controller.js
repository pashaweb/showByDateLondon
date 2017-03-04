/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/favorites              ->  index
 * POST    /api/favorites              ->  create
 * GET     /api/favorites/:id          ->  show
 * PUT     /api/favorites/:id          ->  upsert
 * PATCH   /api/favorites/:id          ->  patch
 * DELETE  /api/favorites/:id          ->  destroy
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.index = index;
exports.show = show;
exports.create = create;
exports.createMulti = createMulti;
exports.upsert = upsert;
exports.patch = patch;
exports.destroy = destroy;

var _fastJsonPatch = require('fast-json-patch');

var _fastJsonPatch2 = _interopRequireDefault(_fastJsonPatch);

var _favorite = require('./favorite.model');

var _favorite2 = _interopRequireDefault(_favorite);

var _event = require('../event/event.model');

var _event2 = _interopRequireDefault(_event);

var _performer = require('../performer/performer.model');

var _performer2 = _interopRequireDefault(_performer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var async = require('async');

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            res.status(statusCode).json(entity);
        }
    };
}

function patchUpdates(patches) {
    return function (entity) {
        try {
            _fastJsonPatch2.default.apply(entity, patches, /*validate*/true);
        } catch (err) {
            return _promise2.default.reject(err);
        }

        return entity.save();
    };
}

function removeEntity(res) {
    return function (entity) {
        if (entity) {
            return entity.remove().then(function () {
                res.status(204).end();
            });
        }
    };
}

function handleEntityNotFound(res) {
    return function (entity) {
        if (!entity) {
            res.status(404).end();
            return null;
        }
        return entity;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        res.status(statusCode).send(err);
    };
}

// Gets a list of Favorites
function index(req, res) {
    return _favorite2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
}

// Gets a single Favorite from the DB
function show(req, res) {
    return _favorite2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new Favorite in the DB
function create(req, res) {
    var $favorite = {};
    //console.log(req.body)
    var events = [];
    return _favorite2.default.create(req.body).then(function (res) {
        _event2.default.update({ name_lower: res._doc.name_lower }, { favorite: true });
        _performer2.default.update({ name_lower: res._doc.name_lower }, { favorite: true });
        _performer2.default.find({ name_lower: res._doc.name_lower }).then(function (list) {
            list = list.map(function (item) {
                return item.id;
            });
            _event2.default.update({ performer: { $in: list } }, { favorite: true }).then(function (res) {
                return console.log(res);
            });
            var ev = _event2.default.find({ performer: { $in: list } }).then(function (res) {
                return console.log(res);
            });
            console.log('list', ev);
        });

        return res;
    }).then(respondWithResult(res, 201)).catch(handleError(res));
}

// Creates Multi  new Favorites in the DB
function createMulti(req, res) {

    var newFavorites = req.body.map(function (item) {
        return { name: item, name_lower: item.toLowerCase() };
    });
    return _favorite2.default.create(newFavorites).then(function (res) {
        res.map(function (fr) {
            // debugger
            _event2.default.update({ name_lower: fr._doc.name_lower }, { favorite: true });
            _performer2.default.update({ name_lower: fr._doc.name_lower }, { favorite: true }).then(function (ttt) {
                return console.log("Perf:", ttt);
            });
            _performer2.default.find({ name_lower: fr._doc.name_lower }).then(function (list) {
                list = list.map(function (item) {
                    return item.id;
                });
                _event2.default.update({ performer: { $in: list } }, { favorite: true }).then(function (res) {
                    return console.log(res);
                });
                var ev = _event2.default.find({ performer: { $in: list } }).then(function (res) {
                    return console.log(res);
                });
                //console.log('list', ev);
            });
        });
        return res;
    }).then(respondWithResult(res, 201)).catch(handleError(res));

    //console.log(newFavorites);

    //return res.status(200).json(req.body);
}

// Upserts the given Favorite in the DB at the specified ID
function upsert(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    return _favorite2.default.findOneAndUpdate(req.params.id, req.body, { upsert: true, setDefaultsOnInsert: true, runValidators: true }).exec().then(respondWithResult(res)).catch(handleError(res));
}

// Updates an existing Favorite in the DB
function patch(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    return _favorite2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(patchUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a Favorite from the DB
function destroy(req, res) {
    return _favorite2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}
//# sourceMappingURL=favorite.controller.js.map
