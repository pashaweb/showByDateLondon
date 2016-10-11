/**
 * Location model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _location = require('./location.model');

var _location2 = _interopRequireDefault(_location);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LocationEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
LocationEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _location2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    LocationEvents.emit(event + ':' + doc._id, doc);
    LocationEvents.emit(event, doc);
  };
}

exports.default = LocationEvents;
//# sourceMappingURL=location.events.js.map
