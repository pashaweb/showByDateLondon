/**
 * Favorite model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _favorite = require('./favorite.model');

var _favorite2 = _interopRequireDefault(_favorite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FavoriteEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
FavoriteEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _favorite2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    FavoriteEvents.emit(event + ':' + doc._id, doc);
    FavoriteEvents.emit(event, doc);
  };
}

exports.default = FavoriteEvents;
//# sourceMappingURL=favorite.events.js.map
