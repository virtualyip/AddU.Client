
angular.module('come_rice', [
  'ionic', 
  'ui.router',
  'ngMessages', 
  'pickadate', 
  'ngCordova', 
  'ngModal',
  'ionic-timepicker', 
  //'720kb.socialshare', 
  'come_rice.services', 
  'jrCrop',
  
  //my app ctr
  'come_rice.main.ctrl', 
  'come_rice.home.ctrl', 
  //'come_rice.registration.ctrl', 
  'come_rice.login.ctrl', 
  'come_rice.profile.ctrl', 
  'come_rice.editEvent.ctrl',
  'come_rice.eventDetail.ctrl',
  'come_rice.eventList.ctrl',
  'come_rice.eventUser.ctrl',
  'come_rice.chatroom.ctrl',
  'come_rice.search.ctrl',
  'come_rice.setting.ctrl'
])

.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  };
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom'); //other values: top
  $ionicConfigProvider.backButton.previousTitleText(false).text('');
  
  $urlRouterProvider.otherwise('/tab/home?sort=date');

  $stateProvider
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'app/tabs/tabs.html'
    })
    
    .state('tab.home', {
      url: '/home?sort&keyword&district&sex&age&native&date_from&date_to',
      views: {
        'tab-content': {
          templateUrl: 'app/home/home.html',
        },
      }
    })
    
    .state('tab.editEvent', {
      url: '/editEvent/:table_id',
      views: {
        'tab-event': {
          templateUrl: 'app/editEvent/editEvent.html'
        },
      }
    })
    
    
    .state('tab.search', {
      url: '/search',
      views: {
        'tab-search': {
          templateUrl: 'app/search/search.html',
        },
      }
    })
    
    .state('tab.profile', {
      url: '/profile/:user_id?sort&view',
      //abstract: true,
      views: {
        'tab-profile': {
          templateUrl: 'app/profile/profile.html'
        },
      }
    })

    .state('tab.event', {
      cache: false,
      url: '/event/:table_id',
      views: {
        'tab-content': {
          templateUrl: 'app/eventDetail/eventDetail.html',
        }
      }
    })
    
    .state('tab.setting', {
      url: '/setting',
      views: {
        'tab-profile': {
          templateUrl: 'app/setting/setting.html',
        },
      }
    })
    
    .state('tab.profileView', {
      url: '/profile/:user_id?sort&view',
      //abstract: true,
      views: {
        'tab-content': {
          templateUrl: 'app/profile/profile.html'
        },
      }
    })
    
    .state('tab.feedback', {
      url: '/feedback',
      //abstract: true,
      views: {
        'tab-feedback': {
          templateUrl: 'app/feedback/feedback.html'
        },
      }
    })
    
    ;
});
