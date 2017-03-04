"use strict";

// Import the dependencies

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.job = job;

var _website = require("../api/website/website.model");

var _website2 = _interopRequireDefault(_website);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cheerio = require("cheerio"),
    req = require("tinyreq");
var webSiteName = "london.eventful.com";
var sitePrefix = 'http://london.eventful.com';
var webSiteID = "";
var async = require('async');
var saveToDB = require('./util/saveToDB');
var moment = require('moment-timezone');
var page = 0;
var resp;
var types = [{
    eventType: 'SportEvent',
    performerType: 'sportPerformer',
    link: 'http://london.eventful.com/v2/tools/events/faceted_search?' + 'type=asynch' + '&location_type=metro_id&location_id=67' + '&sort=rec&page_size=100' + '&when=future&worldwide=0' + '&category=sports' + '&_s_category=sports' + '&page_number='
}, {
    eventType: 'MusicEvent',
    performerType: 'MusicPerformer',
    link: 'http://london.eventful.com/v2/tools/events/faceted_search?' + 'type=asynch' + '&location_type=metro_id&location_id=67' + '&sort=rec&page_size=100' + '&when=future&worldwide=0' + '&category=music' + '&_s_category=music' + '&page_number='
}
// ,
// {
//   eventType: 'TheaterEvent',
//   performerType: 'TheaterPerformer',
//   link: 'http://tickets.london/search?browseorder=soonest&dend=26%2F12%2F2016&distance=0&availableonly=False&showfavourites=True&se=False&s=theatre&pageSize=30&pageIndex='
// }
];
var index = 0;
var currentType = types[0];
// Define the scrape function
function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            res.status(statusCode).json(entity);
        }
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        res.status(statusCode).send(err);
    };
}

function scrape(url, cb) {
    // 1. Create the request
    req(url, function (err, body) {
        if (err) {
            console.log("error:", err);
            return cb(err);
        }

        // 2. Parse the HTML
        var $ = cheerio.load(body),
            pageData = [];
        var events = $('#events-list li[itemscope]');
        if (events.length == 0) {
            console.log('events.length', events.length);
            cb(true, "no more data");
        } else {
            (function () {
                var arr = [];
                events.each(function (i, element) {

                    var el = cheerio.load($(this).html());
                    var performerName = el('h4 a').attr('title').split(' - ');
                    performerName = performerName[0];
                    var obj = {
                        '@type': currentType.eventType,
                        name: el('h4 a').attr('title'),
                        url: el('.tn-frame').attr("href"),
                        location: {
                            "name": el('.event-meta span').text()
                            //,
                            //"link": el('p a').attr("href")
                        },
                        startDate: moment.tz(moment(el('.event-meta strong').attr('content')), "Europe/London").format('x'), ///el('.event-meta strong').attr('content'),
                        endDate: moment.tz(moment(el('.event-meta strong').attr('content')), "Europe/London").format('x'),
                        performer: [{
                            '@type': currentType.performerType,
                            'name': performerName
                            //'sameAs': sitePrefix + el('h3 a').attr("href")
                        }],
                        price: '',
                        eventImage: el('.tn-frame img').attr("src"),
                        active: true,
                        website: webSiteID
                    };
                    //console.log('Object:', obj);
                    //console.log('url:', obj.eventImage);
                    arr.push(obj);
                });
                cb(null, arr);
            })();
        }
    });
}

// Extract some data from my website
function locationCB(data) {

    respondWithResult(data, 200);
}

function getWebSiteID(res) {
    _website2.default.findOne({ name: webSiteName }).then(function (response) {
        if (response !== null) {
            webSiteID = response._id;
            //parceResult(data, res);
            getHtmlPage();
        } else {
            _website2.default.create({
                name: webSiteName,
                websiteUrl: "http://london.eventful.com",
                rating: 5,
                logoUrl: "",
                defaultImageUrl: "",
                active: true
            }).then(function (response) {
                webSiteID = response._id;
                getHtmlPage();
            });
        }
    });
}
function job(req, res) {
    console.log("Started");
    page = 0;
    index = 0;
    currentType = types[0];
    getWebSiteID();
    resp = res;
    return res.status(200).json({ message: "process started" });
}

function goToNextCategory() {
    index = index + 1;
    currentType = types[index];
    page = 0;
    getHtmlPage();
}

function getHtmlPage() {
    page++;
    //console.log("Get Page:", page);
    //console.log('Page:', currentType.link + page.toString());
    scrape(currentType.link + page.toString(), function (err, data) {

        if (err) {
            console.log(index);
            if (index < 1) {
                goToNextCategory();
            } else {
                console.log("End of process");
                return;
            }
            //process.exit();
        } else {
            console.log(data);
            /// parceResult(data);
            saveToDB.save(data, webSiteID, getHtmlPage);
        }
    });
}

function checkWebsiteInDB() {}
//# sourceMappingURL=london.eventful.js.map
