'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getID = getID;

var _location = require('../../api/location/location.model');

var _location2 = _interopRequireDefault(_location);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getID(location, cb) {
  _location2.default.findOne({ 'name': location.name }).then(function (res) {
    if (res != null) {
      cb(null, res._id);
    } else {
      _location2.default.create({
        "type": "Place",
        "address": {
          "type": "PostalAddress",
          "addressLocality": location.address ? location.address.addressLocality : "",
          "addressCountry": location.address ? location.address.addressCountry : "",
          "streetAddress": location.address ? location.address.streetAddress : "",
          "postalCode": location.address ? location.address.postalCode : ""
        },
        "name": location.name,
        "link": location.sameAs,
        "geo": {
          "type": "GeoCoordinates",
          "latitude": location.geo ? location.geo.latitude : 0,
          "longitude": location.geo ? location.geo.longitude : 0
        }

      }).then(function (res) {
        cb(null, res._id);
      });
    }
  });
} /**
   * Created by Pavel.Kogan on 13/08/2016.
   */
//# sourceMappingURL=locationToID.js.map
