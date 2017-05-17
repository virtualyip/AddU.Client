angular.module('come_rice.setting.ctrl', [])

.controller('SettingCtrl', function($scope, $rootScope, $state, $stateParams, $timeout, UserService
  ,$ionicPopup) {
    
  $scope.settingInit = function(){
    $scope.getUserInfo(function(){
      $scope.user_info = UserService.get_info();
      $scope.user = UserService.get();
      console.log($scope.user_info);
    });
    
    if($rootScope.isMobile && $rootScope.APP_VERSION_CURRENT != $rootScope.APP_VERSION_LASTEST){
      $ionicPopup.confirm({
        title: APP_UPDATE_TITLE,
        template: APP_UPDATE_INFO
      }).then(function(res) {
        if(res) {
          window.open('http://ngcordova.com', '_blank', "location=yes");
        }
      });
    }
  };
  $scope.settingInit();
});