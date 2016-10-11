'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getID = getID;

var _eventType = require('../../api/eventType/eventType.model');

var _eventType2 = _interopRequireDefault(_eventType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var async = require('async'); /**
                               * Created by Pavel.Kogan on 14/08/2016.
                               */
function getID(name, cb) {
  _eventType2.default.findOne({ eventTypeName: name }).then(function (res) {
    if (res !== null) {
      cb(null, res._id);
      //return res;
    } else {
      _eventType2.default.create({
        eventTypeName: name,
        active: true
      }).then(function (res) {
        cb(null, res._id);
        //return res;
      });
    }
  }).catch(function (err) {
    cb(err, null);
    return err;
  });
}
//# sourceMappingURL=eventTypeToID.js.map
