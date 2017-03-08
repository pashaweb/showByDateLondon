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
var webSiteName = "ticketmaster.co.uk";
var saveToDB = require('./util/saveToDB');
var venues = new _map2.default();
var events = [];
var webSiteID = "";
var websiteUrl = "http://www.ticketmaster.co.uk";
var config = [{ url: 'http://www.ticketmaster.co.uk/json/browse/sports?select=n186&dma_id=602', eventType: 'SportEvent', performerType: 'SportPerformer' }, { url: 'http://www.ticketmaster.co.uk/json/browse/music?select=n186&dma_id=602', eventType: 'MusicEvent', performerType: 'MusicPerformer' }, { url: 'http://www.ticketmaster.co.uk/json/browse/arts?select=n186&dma_id=602', eventType: 'TheaterEvent', performerType: 'TheaterPerformer' }];
var currentConfigIndex = 0;

function job(req, res) {
    getWebSiteID();
    return res.status(200).json({ message: "process started" });
}

function getWebSiteID(res) {
    _website2.default.findOne({ name: webSiteName }).then(function (response) {
        if (response !== null) {
            webSiteID = response._id;
            //parceResult(data, res);
            getEvents();
        } else {
            _website2.default.create({
                name: webSiteName,
                websiteUrl: websiteUrl,
                rating: 5,
                logoUrl: "",
                defaultImageUrl: "",
                active: true
            }).then(function (response) {
                webSiteID = response._id;
                getEvents();
            });
        }
    });
}

function getEvents() {
    client.get(config[currentConfigIndex].url, function (data, response) {
        events = data.response.docs.map(function (ev) {
            //let venue = venues.get(ev.VenueId);
            var eventName = ev.AttractionName[ev.AttractionName.length - 1];

            if (ev.AttractionName.length > 1) {
                ev.AttractionName.pop();
            }
            var venue = {
                "type": "Place",
                "address": {
                    "type": "PostalAddress",
                    "addressLocality": ev.VenueAddress,
                    "streetAddress": "London"
                },
                "name": ev.VenueName
            };
            var performers = ev.AttractionName.map(function (attraction) {
                return {
                    '@type': config[currentConfigIndex].performerType,
                    'name': attraction
                };
            });
            return {
                '@type': config[currentConfigIndex].eventType,
                name: eventName,
                url: websiteUrl + ev.VenueAttractionSeoLink,
                location: venue,
                startDate: moment.tz(ev.EventDate, "Europe/London").format('x'), ///el('.event-meta strong').attr('content'),
                endDate: moment.tz(ev.EventDate, "Europe/London").format('x'),
                performer: performers,
                price: '',
                eventImage: ev.AttractionImage[0] && ev.AttractionImage[0] ? 'http://media.ticketmaster.co.uk' + ev.AttractionImage[0] : '',
                active: true,
                website: webSiteID
            };
        });
        console.log(events);
        if (config[currentConfigIndex].eventType == 'TheaterEvent') {
            var myMap = new _map2.default();
            for (var i = 0; i < events.length; i++) {
                var name = events[i].name;
                var tempFromMap = myMap.get(name);
                if (tempFromMap == null) {
                    myMap.set(name, events[i]);
                } else {
                    tempFromMap.endDate = events[i].endDate;
                    myMap.set(name, tempFromMap);
                }
            }
            events = [];
            myMap.forEach(function (value, key) {
                events.push(value);
            });
        }

        saveToDB.save(events, webSiteID, endProcess);
        currentConfigIndex += 1;
        if (currentConfigIndex < config.length) {
            getEvents();
        }
    });
}

function endProcess() {
    currentConfigIndex = 0;
    console.log('End Process');
}
//# sourceMappingURL=ticketmaster.js.map
