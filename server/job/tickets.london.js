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
var webSiteName = "tickets.london";
var sitePrefix = 'http://tickets.london';
var webSiteID = "";
var async = require('async');
var saveToDB = require('./util/saveToDB');
var moment = require('moment-timezone');
var page = 0;
var resp;
var types = [{
  eventType: 'SportEvent',
  performerType: 'sportPerformer',
  link: 'http://tickets.london/search?browseorder=soonest&dend=26%2F12%2F2016&distance=0&availableonly=False&showfavourites=True&se=False&s=sport&pageSize=30&pageIndex='
}, {
  eventType: 'TheaterEvent',
  performerType: 'TheatrePerformer',
  link: 'http://tickets.london/search?browseorder=soonest&dend=26%2F12%2F2016&distance=0&availableonly=False&showfavourites=True&se=False&s=theatre&pageSize=30&pageIndex='
}, {
  eventType: 'MusicEvent',
  performerType: 'MusicPerformer',
  link: 'http://tickets.london/search?browseorder=soonest&dend=26%2F12%2F2016&distance=0&availableonly=False&showfavourites=True&se=False&s=music&pageSize=30&pageIndex='
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
  // 1. Create the request
  req(url, function (err, body) {
    if (err) {
      console.log("error:", err);
      return cb(err);
    }

    // 2. Parse the HTML
    var $ = cheerio.load(body),
        pageData = [];
    var events = $('#search-results .results-div, #search-results article');
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
            var date = moment(datePre[1] + ' ' + p[1].children[0].data, 'YYYY dddd Do MMMM at h:mm A').format('x');
            if (!isNaN(date)) {
              var obj = {
                '@type': currentType.eventType,
                name: _el('h3 a').text(),
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
