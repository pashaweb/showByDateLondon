'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addressSchema = new _mongoose2.default.Schema({

  "type": String,
  "addressLocality": String,
  "addressCountry": String,
  "streetAddress": String,
  "postalCode": String

});
var geo = new _mongoose2.default.Schema({

  "type": String,
  "latitude": Number,
  "longitude": Number
});
var PlaceSchema = new _mongoose2.default.Schema({
  "type": String,
  "address": addressSchema,
  "name": String,
  "link": String,
  "geo": geo
});

exports.default = _mongoose2.default.model('Place', PlaceSchema);
//# sourceMappingURL=place.model.js.map
