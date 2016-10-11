/**
 * Place model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _place = require('./place.model');

var _place2 = _interopRequireDefault(_place);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PlaceEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
PlaceEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _place2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    PlaceEvents.emit(event + ':' + doc._id, doc);
    PlaceEvents.emit(event, doc);
  };
}

exports.default = PlaceEvents;
//# sourceMappingURL=place.events.js.map
