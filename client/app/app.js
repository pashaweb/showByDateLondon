'use strict';

angular.module('showByDateApp', ['showByDateApp.constants', 'ngCookies', 'ngResource', 'ngSanitize', 'btford.socket-io', 'ui.router', 'ui.bootstrap']).config(function ($urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/');

  $locationProvider.html5Mode(true);
});
//# sourceMappingURL=app.js.map

'use strict';

angular.module('showByDateApp.util', []);
//# sourceMappingURL=util.module.js.map

"use strict";

(function (angular, undefined) {
	angular.module("showByDateApp.constants", []).constant("appConfig", {
		"userRoles": ["guest", "user", "admin"]
	});
})(angular);
//# sourceMappingURL=app.constant.js.map

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  var MainController = function () {
    function MainController($http, $scope, socket) {
      _classCallCheck(this, MainController);

      this.$http = $http;
      this.socket = socket;
      this.awesomeThings = [];

      $scope.$on('$destroy', function () {
        socket.unsyncUpdates('thing');
      });
    }

    _createClass(MainController, [{
      key: '$onInit',
      value: function $onInit() {
        var _this = this;

        this.$http.get('/api/things').then(function (response) {
          _this.awesomeThings = response.data;
          _this.socket.syncUpdates('thing', _this.awesomeThings);
        });
      }
    }, {
      key: 'addThing',
      value: function addThing() {
        if (this.newThing) {
          this.$http.post('/api/things', {
            name: this.newThing
          });
          this.newThing = '';
        }
      }
    }, {
      key: 'deleteThing',
      value: function deleteThing(thing) {
        this.$http.delete('/api/things/' + thing._id);
      }
    }]);

    return MainController;
  }();

  angular.module('showByDateApp').component('main', {
    templateUrl: 'app/main/main.html',
    controller: MainController
  });
})();
//# sourceMappingURL=main.controller.js.map

'use strict';

angular.module('showByDateApp').config(function ($stateProvider) {
  $stateProvider.state('main', {
    url: '/',
    template: '<main></main>'
  });
});
//# sourceMappingURL=main.js.map

'use strict';

angular.module('showByDateApp').directive('footer', function () {
  return {
    templateUrl: 'components/footer/footer.html',
    restrict: 'E',
    link: function link(scope, element) {
      element.addClass('footer');
    }
  };
});
//# sourceMappingURL=footer.directive.js.map

'use strict';

angular.module('showByDateApp').factory('Modal', function ($rootScope, $uibModal) {
  /**
   * Opens a modal
   * @param  {Object} scope      - an object to be merged with modal's scope
   * @param  {String} modalClass - (optional) class(es) to be applied to the modal
   * @return {Object}            - the instance $uibModal.open() returns
   */
  function openModal() {
    var scope = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var modalClass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'modal-default';

    var modalScope = $rootScope.$new();

    angular.extend(modalScope, scope);

    return $uibModal.open({
      templateUrl: 'components/modal/modal.html',
      windowClass: modalClass,
      scope: modalScope
    });
  }

  // Public API here
  return {

    /* Confirmation modals */
    confirm: {

      /**
       * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
       * @param  {Function} del - callback, ran when delete is confirmed
       * @return {Function}     - the function to open the modal (ex. myModalFn)
       */
      delete: function _delete() {
        var del = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : angular.noop;

        /**
         * Open a delete confirmation modal
         * @param  {String} name   - name or info to show on modal
         * @param  {All}           - any additional args are passed straight to del callback
         */
        return function () {
          var args = Array.prototype.slice.call(arguments),
              name = args.shift(),
              deleteModal;

          deleteModal = openModal({
            modal: {
              dismissable: true,
              title: 'Confirm Delete',
              html: '<p>Are you sure you want to delete <strong>' + name + '</strong> ?</p>',
              buttons: [{
                classes: 'btn-danger',
                text: 'Delete',
                click: function click(e) {
                  deleteModal.close(e);
                }
              }, {
                classes: 'btn-default',
                text: 'Cancel',
                click: function click(e) {
                  deleteModal.dismiss(e);
                }
              }]
            }
          }, 'modal-danger');

          deleteModal.result.then(function (event) {
            del.apply(event, args);
          });
        };
      }
    }
  };
});
//# sourceMappingURL=modal.service.js.map

'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NavbarController = function NavbarController() {
  _classCallCheck(this, NavbarController);
};

angular.module('showByDateApp').controller('NavbarController', NavbarController);
//# sourceMappingURL=navbar.controller.js.map

'use strict';

angular.module('showByDateApp').directive('navbar', function () {
  return {
    templateUrl: 'components/navbar/navbar.html',
    restrict: 'E',
    controller: 'NavbarController',
    controllerAs: 'nav'
  };
});
//# sourceMappingURL=navbar.directive.js.map

/* global io */
'use strict';

angular.module('showByDateApp').factory('socket', function (socketFactory) {
  // socket.io now auto-configures its connection when we ommit a connection url
  var ioSocket = io('', {
    // Send auth token on connection, you will need to DI the Auth service above
    // 'query': 'token=' + Auth.getToken()
    path: '/socket.io-client'
  });

  var socket = socketFactory({
    ioSocket: ioSocket
  });

  return {
    socket: socket,

    /**
     * Register listeners to sync an array with updates on a model
     *
     * Takes the array we want to sync, the model name that socket updates are sent from,
     * and an optional callback function after new items are updated.
     *
     * @param {String} modelName
     * @param {Array} array
     * @param {Function} cb
     */
    syncUpdates: function syncUpdates(modelName, array, cb) {
      cb = cb || angular.noop;

      /**
       * Syncs item creation/updates on 'model:save'
       */
      socket.on(modelName + ':save', function (item) {
        var oldItem = _.find(array, {
          _id: item._id
        });
        var index = array.indexOf(oldItem);
        var event = 'created';

        // replace oldItem if it exists
        // otherwise just add item to the collection
        if (oldItem) {
          array.splice(index, 1, item);
          event = 'updated';
        } else {
          array.push(item);
        }

        cb(event, item, array);
      });

      /**
       * Syncs removed items on 'model:remove'
       */
      socket.on(modelName + ':remove', function (item) {
        var event = 'deleted';
        _.remove(array, {
          _id: item._id
        });
        cb(event, item, array);
      });
    },


    /**
     * Removes listeners for a models updates on the socket
     *
     * @param modelName
     */
    unsyncUpdates: function unsyncUpdates(modelName) {
      socket.removeAllListeners(modelName + ':save');
      socket.removeAllListeners(modelName + ':remove');
    }
  };
});
//# sourceMappingURL=socket.service.js.map

'use strict';

(function () {

  /**
   * The Util service is for thin, globally reusable, utility functions
   */
  function UtilService($window) {
    var Util = {
      /**
       * Return a callback or noop function
       *
       * @param  {Function|*} cb - a 'potential' function
       * @return {Function}
       */
      safeCb: function safeCb(cb) {
        return angular.isFunction(cb) ? cb : angular.noop;
      },


      /**
       * Parse a given url with the use of an anchor element
       *
       * @param  {String} url - the url to parse
       * @return {Object}     - the parsed url, anchor element
       */
      urlParse: function urlParse(url) {
        var a = document.createElement('a');
        a.href = url;

        // Special treatment for IE, see http://stackoverflow.com/a/13405933 for details
        if (a.host === '') {
          a.href = a.href;
        }

        return a;
      },


      /**
       * Test whether or not a given url is same origin
       *
       * @param  {String}           url       - url to test
       * @param  {String|String[]}  [origins] - additional origins to test against
       * @return {Boolean}                    - true if url is same origin
       */
      isSameOrigin: function isSameOrigin(url, origins) {
        url = Util.urlParse(url);
        origins = origins && [].concat(origins) || [];
        origins = origins.map(Util.urlParse);
        origins.push($window.location);
        origins = origins.filter(function (o) {
          var hostnameCheck = url.hostname === o.hostname;
          var protocolCheck = url.protocol === o.protocol;
          // 2nd part of the special treatment for IE fix (see above):  
          // This part is when using well-known ports 80 or 443 with IE,
          // when $window.location.port==='' instead of the real port number.
          // Probably the same cause as this IE bug: https://goo.gl/J9hRta
          var portCheck = url.port === o.port || o.port === '' && (url.port === '80' || url.port === '443');
          return hostnameCheck && protocolCheck && portCheck;
        });
        return origins.length >= 1;
      }
    };

    return Util;
  }

  angular.module('showByDateApp.util').factory('Util', UtilService);
})();
//# sourceMappingURL=util.service.js.map

angular.module("showByDateApp").run(["$templateCache", function($templateCache) {$templateCache.put("components/footer/footer.html","<div class=\"container\">\n  <p>Angular Fullstack v3.7.6 |\n    <a href=\"https://twitter.com/tyhenkel\">@tyhenkel</a> |\n    <a href=\"https://github.com/DaftMonk/generator-angular-fullstack/issues?state=open\">Issues</a>\n  </p>\n</div>\n");
$templateCache.put("app/main/main.html","<header class=\"hero-unit\" id=\"banner\">\n  <div class=\"container\">\n    <h1>\'Allo, \'Allo!</h1>\n    <p class=\"lead\">Kick-start your next web app with Angular Fullstack</p>\n    <img src=\"assets/images/yeoman-1cab7d4d37.png\" alt=\"I\'m Yeoman\">\n  </div>\n</header>\n\n<div class=\"container\">\n  <div class=\"row\">\n    <div class=\"col-lg-12\">\n      <h1 class=\"page-header\">Features:</h1>\n      <ul class=\"nav nav-tabs nav-stacked col-md-4 col-lg-4 col-sm-6\" ng-repeat=\"thing in $ctrl.awesomeThings\">\n        <li><a href=\"#\" uib-tooltip=\"{{thing.info}}\">{{thing.name}}<button type=\"button\" class=\"close\" ng-click=\"$ctrl.deleteThing(thing)\">&times;</button></a></li>\n      </ul>\n    </div>\n  </div>\n\n  <form class=\"thing-form\">\n    <label>Syncs in realtime across clients</label>\n    <p class=\"input-group\">\n      <input type=\"text\" class=\"form-control\" placeholder=\"Add a new thing here.\" ng-model=\"$ctrl.newThing\">\n      <span class=\"input-group-btn\">\n        <button type=\"submit\" class=\"btn btn-primary\" ng-click=\"$ctrl.addThing()\">Add New</button>\n      </span>\n    </p>\n  </form>\n</div>\n");
$templateCache.put("components/modal/modal.html","<div class=\"modal-header\">\n  <button ng-if=\"modal.dismissable\" type=\"button\" ng-click=\"$dismiss()\" class=\"close\">&times;</button>\n  <h4 ng-if=\"modal.title\" ng-bind=\"modal.title\" class=\"modal-title\"></h4>\n</div>\n<div class=\"modal-body\">\n  <p ng-if=\"modal.text\" ng-bind=\"modal.text\"></p>\n  <div ng-if=\"modal.html\" ng-bind-html=\"modal.html\"></div>\n</div>\n<div class=\"modal-footer\">\n  <button ng-repeat=\"button in modal.buttons\" ng-class=\"button.classes\" ng-click=\"button.click($event)\" ng-bind=\"button.text\" class=\"btn\"></button>\n</div>\n");
$templateCache.put("components/navbar/navbar.html","<div class=\"navbar navbar-default navbar-static-top\" ng-controller=\"NavbarController\">\n  <div class=\"container\">\n    <div class=\"navbar-header\">\n      <button class=\"navbar-toggle\" type=\"button\" ng-click=\"nav.isCollapsed = !nav.isCollapsed\">\n        <span class=\"sr-only\">Toggle navigation</span>\n        <span class=\"icon-bar\"></span>\n        <span class=\"icon-bar\"></span>\n        <span class=\"icon-bar\"></span>\n      </button>\n      <a href=\"/\" class=\"navbar-brand\">show-by-date</a>\n    </div>\n    <div uib-collapse=\"nav.isCollapsed\" class=\"navbar-collapse collapse\" id=\"navbar-main\">\n      <ul class=\"nav navbar-nav\">\n        <li ng-repeat=\"item in nav.menu\" ui-sref-active=\"active\">\n            <a ui-sref=\"{{item.state}}\">{{item.title}}</a>\n        </li>\n      </ul>\n    </div>\n  </div>\n</div>\n");}]);