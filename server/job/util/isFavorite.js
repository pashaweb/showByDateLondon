'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getFavorite = getFavorite;

var _favorite = require('../../api/favorite/favorite.model');

var _favorite2 = _interopRequireDefault(_favorite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var async = require('async');

function getFavorite(name, cb) {
    var isFavorite = false;
    _favorite2.default.findOne({ name_lower: name }).then(function (res) {
        if (res != null) {
            callback(true);
        } else {
            callback(false);
        }
    });
}
//# sourceMappingURL=isFavorite.js.map
