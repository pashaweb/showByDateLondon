/**
 * Website model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _website = require('./website.model');

var _website2 = _interopRequireDefault(_website);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WebsiteEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
WebsiteEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _website2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    WebsiteEvents.emit(event + ':' + doc._id, doc);
    WebsiteEvents.emit(event, doc);
  };
}

exports.default = WebsiteEvents;
//# sourceMappingURL=website.events.js.map
