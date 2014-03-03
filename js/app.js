var timelineWithAnimation = angular.module(
  'timeline-with-animation', [
    'ngRoute',
    'ngSanitize',
    'ngAnimate',
    'shoppinpal.mobile-menu'
  ]
);

timelineWithAnimation.config([
  '$routeProvider',
  function($routeProvider) {
    'use strict';

    $routeProvider.when('/', {
      templateUrl: '/ng_templates/timeline_list.html',
      controller: 'RootCtrl'
    });

    $routeProvider.when('/items/:itemId', {
      templateUrl: '/ng_templates/timeline_item.html',
      controller: 'RootCtrl'
    });

    $routeProvider.otherwise({
      templateUrl: '/ng_templates/page_under_construction.html',
      controller: 'RootCtrl'
    });
  }]);

var timelineListRegexp = /\/(index.html)?#\/$/;
var timelineItemRegexp = /\/(index.html)?#\/items\/[0-9]+$/;

function getPageType(url) {
  if (timelineListRegexp.test(url)) {
    return 'timelineList';
  }
  if (timelineItemRegexp.test(url)) {
    return 'timelineItem';
  }
  return 'unrecognized';
}

timelineWithAnimation
  .controller('RootCtrl', function($scope, $rootScope, $location, $spMenu) {
    $scope.gotoUrlFor = function (path) {
      $location.path(path);
    };

    $rootScope.$on(
      '$locationChangeStart',
      function(_, nextPageUrl, currentPageUrl) {

        // Due to menu can not close itself.
        $spMenu.hide();

        var userMoveFrom = getPageType(currentPageUrl);
        var userMoveTo   = getPageType(nextPageUrl);
        var navigationState = ['from', userMoveFrom, 'to', userMoveTo]

        switch (navigationState.join(' ')) {
        case 'from timelineList to timelineItem':
          $scope.animateFlavor = 'move-to-left';
          break;
        case 'from timelineItem to timelineList':
          $scope.animateFlavor = 'move-to-right';
          break;
        case 'from timelineList to unrecognized':
          $scope.animateFlavor = 'move-to-right';
          break;
        default:
          $scope.animateFlavor = 'move-to-left';
          break;
        }

        $scope.currentPage = userMoveTo;
      });
  });

timelineWithAnimation
  .controller('TimelineListCtrl', function($scope, $route, $routeParams) {
    $scope.items = patients['MrBrown'].timelineItems.sort(function(a, b){
      return b.createdAt - a.createdAt;
    });
  });

timelineWithAnimation.
  controller('TimelineItemsCtrl', function($scope, $route, $routeParams) {
    $scope.item = jQuery.grep(patients['MrBrown'].timelineItems, function(item) {
      return item.id.toString() === $routeParams.itemId.toString();
    })[0];
  });
