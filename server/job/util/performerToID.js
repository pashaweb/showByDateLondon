'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getID = getID;

var _performer = require('../../api/performer/performer.model');

var _performer2 = _interopRequireDefault(_performer);

var _favorite = require('../../api/favorite/favorite.model');

var _favorite2 = _interopRequireDefault(_favorite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by Pavel.Kogan on 13/08/2016.
 */
var async = require('async');
function getID(list, cb) {
    var idsList = [];
    var hasFavorites = false;
    //console.log(list.length)
    async.eachSeries(list, function (item, next) {
        _performer2.default.findOne({ name: item.name }).then(function (res) {
            if (res !== null) {
                idsList.push(res._id);
                if (res.favorite) {
                    hasFavorites = true;
                }
                next();
            } else {
                async.waterfall([function (callback) {
                    var tempName = item.name.toLowerCase();
                    _favorite2.default.findOne({ name_lower: tempName }).then(function (res) {
                        if (res != null) {
                            item.favorite = true;
                            hasFavorites = true;
                        } else {
                            item.favorite = false;
                        }
                        callback(null);
                    });
                }, function (callback) {
                    _performer2.default.create({
                        type: item["@type"],
                        name: item["name"],
                        name_lower: item["name"].toLowerCase(),
                        link: item["sameAs"],
                        favorite: item.favorite,
                        active: true
                    }).then(function (res) {
                        //console.log("Per Created arr: ", res[0].id);
                        //console.log("Per Created: ", res.id);
                        idsList.push(res._id);
                        callback(null);
                    });
                }], function (err, result) {
                    next();
                });
            }
        });
    }, function (err) {
        //console.log(idsList)
        cb(null, { idsList: idsList, hasFavorites: hasFavorites });
    });
}
//# sourceMappingURL=performerToID.js.map
