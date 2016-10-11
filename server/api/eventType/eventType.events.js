/**
 * EventType model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _eventType = require('./eventType.model');

var _eventType2 = _interopRequireDefault(_eventType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventTypeEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
EventTypeEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _eventType2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    EventTypeEvents.emit(event + ':' + doc._id, doc);
    EventTypeEvents.emit(event, doc);
  };
}

exports.default = EventTypeEvents;
//# sourceMappingURL=eventType.events.js.map
