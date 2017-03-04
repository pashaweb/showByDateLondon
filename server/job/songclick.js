"use strict";

// Import the dependencies
// import _ from 'lodash';
// import show_by_date_event from '../api/event/event.model';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.job = job;

var _website = require("../api/website/website.model");

var _website2 = _interopRequireDefault(_website);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cheerio = require("cheerio"),
    req = require("tinyreq");
var songkickName = "Songkick";
var songkickID = "";
var async = require('async');
var saveToDB = require('./util/saveToDB');
var moment = require('moment');
var page = 0;
var resp;
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
        var count = $("#event-listings li[title]").length;
        if (count > 0) {
            $("#event-listings li[title]").each(function (i, elem) {
                var el = cheerio.load($(this).html());
                var obj = JSON.parse(el(".microformat script").text());
                obj = obj[0];
                obj.url = "https://www.songkick.com" + el(".thumb").attr("href");
                obj.eventImage = "http:" + el('.thumb img').attr("src");
                var date = moment(obj.startDate).format('x');
                obj.startDate = date;
                obj.endDate = date;
                pageData.push(obj);
            });
            cb(null, pageData);
        } else {
            cb(true, "no more data");
        }
    });
}

// Extract some data from my website
function locationCB(data) {

    respondWithResult(data, 200);
}

function getSongKickID(res) {
    _website2.default.findOne({ name: songkickName }).then(function (response) {
        if (response !== null) {
            songkickID = response._id;
            //parceResult(data, res);
            getHtmlPage();
        } else {
            _website2.default.create({
                name: songkickName,
                websiteUrl: "https://www.songkick.com",
                rating: 5,
                logoUrl: "https://www.songkick.com",
                defaultImageUrl: "http://assets.sk-static.com/assets/default_images/huge_avatar/default-event-798b09a.png",
                active: true
            }).then(function (response) {
                songkickID = response._id;
                getHtmlPage();
            });
        }
    });
}
function job(req, res) {
    console.log("Started");
    page = 0;
    getSongKickID();
    resp = res;
    return res.status(200).json({ message: "process started" });
}

function getHtmlPage() {
    page++;
    console.log("Get Page:", page);
    scrape("https://www.songkick.com/metro_areas/24426-uk-london?utf8=true&page=" + page //&filters[minDate]="+ dateFrom + "&filters[maxDate]="+ dateTo + "#date-filter-form"
    , function (err, data) {

        //check the db for a songlick website
        if (err) {
            //process.exit();
            console.log("End of process");
            return;
        } else {
            /// parceResult(data);
            saveToDB.save(data, songkickID, getHtmlPage);
        }
    });
}

function checkWebsiteInDB() {}
//# sourceMappingURL=songclick.js.map
