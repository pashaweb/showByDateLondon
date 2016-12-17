'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getID = getID;

var _performer = require('../../api/performer/performer.model');

var _performer2 = _interopRequireDefault(_performer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var async = require('async'); /**
                               * Created by Pavel.Kogan on 13/08/2016.
                               */
function getID(list, cb) {
  var idsList = [];
  //console.log(list.length)
  async.eachSeries(list, function (item, next) {
    _performer2.default.findOne({ name: item.name }).then(function (res) {
      if (res !== null) {
        idsList.push(res._id);
        next();
      } else {
        _performer2.default.create({
          type: item["@type"],
          name: item["name"],
          link: item["sameAs"],
          active: true
        }).then(function (res) {
          //console.log("Per Created arr: ", res[0].id);
          //console.log("Per Created: ", res.id);
          idsList.push(res._id);
          next();
        });
      }
    });
  }, function (err) {
    //console.log(idsList)
    cb(null, idsList);
  });
}
//# sourceMappingURL=performerToID.js.map
