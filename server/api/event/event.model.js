'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventSchema = new _mongoose2.default.Schema({
  eventType: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'EventType' },
  name: String,
  url: String,
  location: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Location' },
  startDate: Number,
  performer: [{ type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Performer' }],
  website: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Website' },
  price: String,
  eventImage: String,
  active: Boolean
});

exports.default = _mongoose2.default.model('Event', EventSchema);
//# sourceMappingURL=event.model.js.map
