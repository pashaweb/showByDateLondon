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
var xRay = require('x-ray');
var x = xRay();

var webSiteName = "tickets.london";
var sitePrefix = 'http://tickets.london';
var webSiteID = "";
var async = require('async');
var saveToDB = require('./util/saveToDB');
var moment = require('moment-timezone');
var page = 0;
var resp;
var types = [

// {
//     eventType: 'MusicEvent',
//     performerType: 'MusicPerformer',
//     link: 'http://tickets.london/search?browseorder=soonest&distance=0&availableonly=False&showfavourites=True&se=False&s=music&pageSize=30&pageIndex='
// },
// {
//     eventType: 'SportEvent',
//     performerType: 'sportPerformer',
//     link: 'http://tickets.london/search?browseorder=soonest&distance=0&availableonly=False&showfavourites=True&se=False&s=sport&pageSize=30&pageIndex='
// },
{
    eventType: 'TheaterEvent',
    performerType: 'TheaterPerformer',
    link: 'http://tickets.london/search?BrowseOrder=Soonest&s=theatre&c=40&c=191&c=195&c=204&c=192&c=274&c=198&c=200&c=196&c=202&q=&dst=&dend=2017-03-31&l='
}];
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
    console.log(url);
    x(url, 'body@html')(function (err, data) {
        debugger;
        console.log(data);
    });
    // 1. Create the request
    req(url, function (err, body) {
        if (err) {
            console.log("error:", err);
            return cb(err);
        }

        // 2. Parse the HTML
        var $ = cheerio.load(body),
            pageData = [];

        var events = []; //$('script');

        debugger;
        if (events.length == 0) {
            console.log('events.length', events.length);
            cb(true, "no more data");
        } else {
            (function () {
                var datePre = [];
                var arr = [];
                events.each(function (i, element) {
                    ///console.log(element.attribs.class)
                    if (element.attribs.class === 'results-div') {
                        var el = cheerio.load($(this).html());
                        datePre = el('span').text().trim().split(' ');
                        //console.log(el('span').text().trim());
                    } else {
                        var _el = cheerio.load($(this).html());
                        var p = _el('p');
                        var date = moment.tz(datePre[1] + ' ' + p[1].children[0].data, 'YYYY dddd Do MMMM at h:mm A', "Europe/London").format('x');
                        var name = '';
                        if (_el('h3 a').length > 1) {
                            var _arr = _el('h3 a');
                            //console.log('count ' + el('h3 a').length, arr);
                            name = _arr[0].children[0].data;
                            //console.log('count ' + el('h3 a').length, arr[0].children[0].data);
                        } else {
                            name = _el('h3 a').text();
                            //console.log('count 1', el('h3 a').text());
                        }
                        if (!isNaN(date)) {
                            var obj = {
                                '@type': currentType.eventType,
                                name: name,
                                url: sitePrefix + _el('h3 a').attr("href"),
                                location: {
                                    "name": _el('p a').text(),
                                    "link": _el('p a').attr("href")
                                },
                                startDate: date,
                                performer: {
                                    '@type': currentType.performerType,
                                    'name': sitePrefix + _el('h3 a').text(),
                                    'sameAs': sitePrefix + _el('h3 a').attr("href")
                                },
                                price: '',
                                eventImage: _el('img').attr("src"),
                                active: true,
                                website: webSiteID
                            };
                            //console.log('Image:', obj.eventImage);
                            arr.push(obj);
                        }
                    }
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
                websiteUrl: "http://tickets.london",
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
            if (index < 2) {
                goToNextCategory();
            } else {
                console.log("End of process");
                return;
            }
            //process.exit();
        } else {
            /// parceResult(data);
            saveToDB.save(data, webSiteID, getHtmlPage);
        }
    });
}

function checkWebsiteInDB() {}
//# sourceMappingURL=tickets.london.js.map
