var timelineWithAnimation = angular.module(
  'timeline-with-animation', [
    'ngRoute',
    'ngSanitize',
    'ngAnimate',
    'shoppinpal.mobile-menu',
    'firebase',
    'ui.calendar',
    'ui.bootstrap'
  ]
);

timelineWithAnimation.factory('Settings', function() {
   var title     = 'TakeCare';
   var header    = 'TakeCare';
   var patientId = null;
   return {
     title: function() { return title; },
     setTitle: function(newTitle) { title = newTitle },
     header: function() { return header; },
     setHeader: function(newHeader) { header = newHeader },
     getPatientId: function() { return patientId; },
     setPatientId: function(patient) {
       if (!patient) {
         patientId = null;
       } else {
         patientId = patient.id;
       }
     }
   };
});

var patientsListRegexp  = /\/doctor.html#\/$/;
var timelineListRegexp  = /\/((doctor|patient).html)?#\/(patients\/[0-9]+)?$/;
var timelineItemRegexp  = /\/((doctor|patient).html)?#\/(patients\/[0-9]+\/)?items\/[0-9]+$/;
var problemListRegexp   = /\/((doctor|patient).html)?#\/(patients\/[0-9]+\/)?problem-list$/;
var allergyListRegexp   = /\/((doctor|patient).html)?#\/(patients\/[0-9]+\/)?allergy-list$/;
var encounterListRegexp = /\/((doctor|patient).html)?#\/(patients\/[0-9]+\/)?encounters$/;
var profileRegexp       = /\/((doctor|patient).html)?#\/(patients\/[0-9]+\/)?profile$/;
var chatRegexp          = /\/((doctor|patient).html)?#\/(patients\/[0-9]+\/)?chat$/;
var calendarRegexp      = /\/((doctor|patient).html)?#\/(patients\/[0-9]+\/)?calendar$/;

function getPageType(url) {
  if (patientsListRegexp.test(url)) {
    return 'patientsList';
  }
  if (timelineListRegexp.test(url)) {
    return 'timelineList';
  }
  if (timelineItemRegexp.test(url)) {
    return 'timelineItem';
  }
  if (problemListRegexp.test(url)) {
    return 'problemList';
  }
  if (allergyListRegexp.test(url)) {
    return 'allergyList';
  }
  if (encounterListRegexp.test(url)) {
    return 'encounterList';
  }
  if (profileRegexp.test(url)) {
    return 'profile';
  }
  if (chatRegexp.test(url)) {
    return 'chat';
  }
  if (calendarRegexp.test(url)) {
    return 'calendar';
  }
  return 'unrecognized';
}

function getPatientById(id) {
  if (!id) {
    return null;
  }
  return jQuery.grep(patientsArrayFor(patients), function(patient) {
    return patient.id.toString() === id.toString();
  })[0];
}

timelineWithAnimation.controller(
  'RootCtrl',
  function($scope, $rootScope, $location, $spMenu, Settings) {
    $scope.gotoUrlFor = function (path) {
      $location.path(path);
    };
    $scope.$back = function() {
      window.history.back();
    };
    $scope.getPatient = function(id) {
      return getPatientById(id);
    };

    $scope.Settings = Settings;

    $scope.$on(
      '$locationChangeStart',
      function(_, nextPageUrl, currentPageUrl) {

        // Due to menu can not close itself.
        $spMenu.hide();

        var userMoveFrom = getPageType(currentPageUrl);
        var userMoveTo   = getPageType(nextPageUrl);

        if ((userMoveTo === 'patientsList')
            || (userMoveTo === 'timelineList' &&
                userMoveFrom !== 'patientsList')) {
          $scope.animateFlavor = 'move-to-right';
        } else {
          $scope.animateFlavor = 'move-to-left';
        }

        $scope.currentPage = userMoveTo;
      });
  });

function patientsArrayFor(patientsObject) {
  return $.map(patients, function(value, index) {
    return value;
  });
}

timelineWithAnimation.controller('PatientsListCtrl', function($scope, Settings) {
  Settings.setPatientId(null);
  $scope.patients = patientsArrayFor(patients).sort(function(a, b){
    return a.id - b.id;
  });
  var title = 'My patients';
  Settings.setTitle(title);
  Settings.setHeader(title);
});

timelineWithAnimation.controller(
  'TimelineListCtrl',
  function($scope, $route, $routeParams, Settings) {
    $scope.patient = getPatientById($routeParams.patientId);
    Settings.setPatientId($scope.patient);
    $scope.items = mrBrownData['TimelineItems'].sort(function(a, b) {
      return b.createdAt - a.createdAt;
    });
    var title = 'Observations';
    Settings.setTitle(title);
    Settings.setHeader(title);
  });

timelineWithAnimation.controller(
  'TimelineItemsCtrl',
  function($scope, $route, $routeParams, Settings) {
    $scope.patient = getPatientById($routeParams.patientId);
    Settings.setPatientId($scope.patient);
    $scope.item = jQuery.grep(mrBrownData['TimelineItems'], function(item) {
      return item.id.toString() === $routeParams.itemId.toString();
    })[0];
    Settings.setTitle('Observation: ' + $scope.item.name);
    Settings.setHeader('Observation');
  });

timelineWithAnimation.controller(
  'ProblemListCtrl',
  function($scope, Settings, $route, $routeParams) {
    $scope.patient = getPatientById($routeParams.patientId);
    Settings.setPatientId($scope.patient);
    var title = 'Problem list';
    Settings.setTitle(title);
    Settings.setHeader(title);
    $scope.items = mrBrownData['Problems'];
  });

timelineWithAnimation.controller(
  'AllergyListCtrl',
  function($scope, Settings, $route, $routeParams) {
    $scope.patient = getPatientById($routeParams.patientId);
    Settings.setPatientId($scope.patient);
    var title = 'Allergy list';
    Settings.setTitle(title);
    Settings.setHeader(title);
    $scope.items = mrBrownData['Allergies'];
  });

timelineWithAnimation.controller(
  'EncounterListCtrl',
  function($scope, Settings, $route, $routeParams) {
    $scope.patient = getPatientById($routeParams.patientId);
    Settings.setPatientId($scope.patient);
    var title = 'Encounters';
    Settings.setTitle(title);
    Settings.setHeader(title);
    $scope.items = mrBrownData['Encounters'];
  });

timelineWithAnimation.controller(
  'ProfileCtrl',
  function($scope, Settings, $route, $routeParams) {
    if ($routeParams.patientId) {
      $scope.patient = getPatientById($routeParams.patientId);
      Settings.setPatientId($scope.patient);
    } else {
      $scope.patient = patients["MrBrown"];
    }
    var title = 'Profile';
    Settings.setTitle(title);
    Settings.setHeader(title);
  });

timelineWithAnimation.controller(
  'ChatCtrl',
  function($scope, $firebase, Settings, $route, $routeParams) {
    $scope.patient = getPatientById($routeParams.patientId);
    Settings.setPatientId($scope.patient);
    var title = 'Chat';
    Settings.setTitle(title);
    Settings.setHeader(title);
    var messagesRef = new Firebase("https://resplendent-fire-4689.firebaseio.com/messages");
    $scope.messages = $firebase(messagesRef);

    $scope.addMessage = function() {
      $scope.messages.$add($scope.newMessage);
      $scope.newMessage = {};
    }
  })

function generateS4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};

function generateGuid() {
  return generateS4() + generateS4() + '-' + generateS4() + '-' +
    generateS4() + '-' + generateS4() + '-' +
    generateS4() + generateS4() + generateS4();
}

timelineWithAnimation.controller(
  'CalendarCtrl',
  function($scope, Settings, $route, $routeParams, $firebase) {
    $scope.patient = getPatientById($routeParams.patientId);
    Settings.setPatientId($scope.patient);
    var title = 'Calendar';
    Settings.setTitle(title);
    Settings.setHeader(title);

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    $scope.events = [];
    $scope.newEvent = {start: new Date()};

    var eventsRef = new Firebase("https://blazing-fire-8127.firebaseio.com/events");
    $scope.eventsRef = $firebase(eventsRef);
    eventsRef.on('child_added', function(snapshot) {
      var event = snapshot.val();
      event.start = new Date(event.start);
      $scope.events.push(event);
    });
    $scope.addEvent = function() {
      $scope.newEvent.id = generateGuid();
      $scope.eventsRef.$add($scope.newEvent);
      $scope.newEvent = {start: new Date()};
    }

    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: false,
        header:{
          left: 'title',
          center: '',
          right: 'today prev,next'
        }
      }
    };

    $scope.eventSources = [$scope.events];
  })

timelineWithAnimation.controller('PageUnderConstructionCtrl', function(Settings) {
  var title = 'Page under construction';
  Settings.setTitle(title);
  Settings.setHeader(title);
});
