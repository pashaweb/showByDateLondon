'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

exports.job = job;

var _website = require('../api/website/website.model');

var _website2 = _interopRequireDefault(_website);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var moment = require('moment-timezone');
var Client = require('node-rest-client').Client;
var client = new Client();
var webSiteName = "londontheatredirect.com";
var saveToDB = require('./util/saveToDB');
var venues = new _map2.default();
var events = [];
var webSiteID = "";
var args = {
    headers: {
        'Api-Key': 'gtemuger8779r4thqth7ptab',
        'Content-Type': 'application/json'
    }
};

function job(req, res) {
    getWebSiteID();
    return res.status(200).json({ message: "process started" });
}

function getWebSiteID(res) {
    _website2.default.findOne({ name: webSiteName }).then(function (response) {
        if (response !== null) {
            webSiteID = response._id;
            //parceResult(data, res);
            getVenues();
        } else {
            _website2.default.create({
                name: webSiteName,
                websiteUrl: "https://www.londontheatredirect.com",
                rating: 5,
                logoUrl: "",
                defaultImageUrl: "",
                active: true
            }).then(function (response) {
                webSiteID = response._id;
                getVenues();
            });
        }
    });
}

function getVenues() {
    venues = new _map2.default();
    client.get("https://api.londontheatredirect.com/rest/v2/Venues", args, function (data, response) {
        var venuesTemp = data.Venues.map(function (loc) {
            return {
                "VenueId": loc.VenueId,
                "type": "Place",
                "address": {
                    "type": "PostalAddress",
                    "addressLocality": loc.City,
                    "streetAddress": loc.Address,
                    "postalCode": loc.Postcode
                },
                "name": loc.Name
            };
        });
        for (var i = 0; i < venuesTemp.length; i++) {
            venues.set(venuesTemp[i].VenueId, venuesTemp[i]);
        }
        getEvents();
    });
}

function getEvents() {
    events = [];
    client.get("https://api.londontheatredirect.com/rest/v2/Events", args, function (data, response) {

        events = data.Events.map(function (ev) {
            var venue = venues.get(ev.VenueId);
            return {
                '@type': 'TheaterEvent',
                name: ev.Name,
                url: ev.EventDetailUrl,
                location: venue,
                startDate: moment.tz(ev.StartDate, "Europe/London").format('x'), ///el('.event-meta strong').attr('content'),
                endDate: moment.tz(ev.EndDate, "Europe/London").format('x'),
                performer: [{
                    '@type': 'TheaterPerformer',
                    'name': ev.Name
                    //'sameAs': sitePrefix + el('h3 a').attr("href")
                }],
                price: '',
                eventImage: ev.SmallImageUrl,
                active: true,
                website: webSiteID
            };
        });
        saveToDB.save(events, webSiteID, endProcess);
    });
}

function endProcess() {
    console.log('End Process');
}
//# sourceMappingURL=londontheatredirect.js.map
