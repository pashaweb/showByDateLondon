'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PerformerSchema = new _mongoose2.default.Schema({
    type: String,
    name: String,
    name_lower: String,
    favorite: Boolean,
    link: String,
    active: Boolean
});

exports.default = _mongoose2.default.model('Performer', PerformerSchema);
//# sourceMappingURL=performer.model.js.map
