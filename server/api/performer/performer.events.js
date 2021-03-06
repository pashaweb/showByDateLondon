/**
 * Performer model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _performer = require('./performer.model');

var _performer2 = _interopRequireDefault(_performer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PerformerEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
PerformerEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _performer2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    PerformerEvents.emit(event + ':' + doc._id, doc);
    PerformerEvents.emit(event, doc);
  };
}

exports.default = PerformerEvents;
//# sourceMappingURL=performer.events.js.map
