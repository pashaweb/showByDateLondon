/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /y              ->  index
 * POST    /y              ->  create
 * GET     /y/:id          ->  show
 * PUT     /y/:id          ->  update
 * DELETE  /y/:id          ->  destroy
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.index = index;
exports.getEventByDatesRangeAndType = getEventByDatesRangeAndType;
exports.show = show;
exports.create = create;
exports.update = update;
exports.destroy = destroy;
exports.destroyAll = destroyAll;
exports.test = test;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _event = require('./event.model');

var _event2 = _interopRequireDefault(_event);

var _eventType = require('../eventType/eventType.model');

var _eventType2 = _interopRequireDefault(_eventType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var moment = require('moment');

function respondWithResult(res, statusCode) {

  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function (entity) {
    var updated = _lodash2.default.merge(entity, updates);
    return updated.save().then(function (updated) {
      return updated;
    });
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

function removeAllEntity(res) {
  return function () {
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
  console.log(res);
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Events
function index(req, res) {
  return _event2.default.find().populate('eventType performer location website').exec().then(respondWithResult(res)).catch(handleError(res));
}

function getEventByDatesRangeAndType(req, res) {
  var dateFrom = req.params.dateFrom; //moment.unix(req.params.dateFrom / 1000).toDate();
  var eventType = req.params.eventType;
  var dateTo = req.params.dateTo; // moment.unix(req.params.dateTo / 1000).toDate();

  var limit = Number(req.params.limit);
  var skip = Number(req.params.skip);
  _eventType2.default.findOne({ eventTypeName: eventType }).then(function (response) {
    if (!response) {
      handleError(res)({
        events: [],
        total: 0
      });
    } else {
      var query = { "startDate": { "$gte": dateFrom, "$lt": dateTo }, 'eventType': response._id };
      getSearch(res, query, limit, skip);
    }
  }, function (response) {
    handleError(res);
  });
};

function getSearch(res, query, limit, skip) {
  return _event2.default.find(query).sort({ 'startDate': 'desc' }).limit(limit).skip(skip).populate('eventType performer location website').exec(function (err, events) {
    _event2.default.count(query).exec(function (err, count) {
      res.status(200).json({
        events: events,
        total: count
      });
      //respondWithResult()
    });
  })
  //.exec()
  //.then(respondWithResult(res))
  .catch(handleError(res));
}

// Gets a single Event from the DB
function show(req, res) {
  console.log("show");
  return _event2.default.findById(req.params.id).populate('eventType').exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new Event in the DB
function create(req, res) {
  return _event2.default.create(req.body).then(respondWithResult(res, 201)).catch(handleError(res));
}

// Updates an existing Event in the DB
function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return _event2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(saveUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a Event from the DB
function destroy(req, res) {
  return _event2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}

// Deletes all events
function destroyAll(req, res) {
  _event2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
  //return Event.remove({}).exec()
  //  .then(respondWithResult("ok",200))
  //  .then(respondWithResult("ok",200))
  //  .catch(handleError(res));
}

//test function

function test(req, res) {
  console.log("Start:");
  var request = require("request");
  var cheerio = require("cheerio");

  request({
    uri: "http://ionicabizau.net"
  }, function (error, response, body) {
    var $ = cheerio.load(body);
    console.log("Got Body");

    ///console.log($);

    var list = [];
    var index = 0;

    console.log("Body:", body);
    console.log("Left:", $("a")[0]);
    //$("a").each(function() {
    //  index++
    //  console.log($(".header h1").text());
    //
    //  //console.log(text + " -> " + href);
    //  res.status(200).json({"test":$(".header h1").text()});
    //});
  });

  //
}
//# sourceMappingURL=event.controller.js.map
