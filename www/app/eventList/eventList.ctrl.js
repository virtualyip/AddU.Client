angular.module('come_rice.eventList.ctrl', [])

.controller('eventListCtrl', function($scope, $rootScope, $state, $stateParams, $ionicPopup, UserService, 
      $timeout, $ionicModal, $ionicSideMenuDelegate, $ionicScrollDelegate) {
  
  $scope.$on('loggedIn', function() {
    $scope.user = UserService.get();
    $scope.user_info = UserService.get_info();
    if($scope.user.user_id != null && $scope.user.token != null){
      $scope.eventListInit();
    }
  });
  
  $scope.eventListInit = function(){
    // Load or initialize projects
    $scope.user = UserService.get();
    $scope.recent_events = [];
    $scope.table_details = {};
    $scope.user_details = {};
    $scope.hasEvent = false;
    $scope.page = 0;
    $scope.isLoading = {};
    $scope.noMoreItemsAvailable = true;
    
    $scope.sort_type = $stateParams.sort;
    if($stateParams.sort != null){
      $scope.get_table_list($stateParams.sort, $scope.page);
    }else{
      if($stateParams.user_id != null){
        $scope.get_table_list('user', $scope.page);
        $scope.sort_type = 'user';
      }else{
        $scope.get_table_list('date', $scope.page);
        $scope.sort_type = 'date';
      }
    }
  };
  $timeout(function(){$scope.eventListInit();});
  
  
  $scope.get_table_list = function(type, p){  
    p == 0 ? $scope.isLoading.event_list = true : $scope.isLoading.loadMore = true;
    $scope.sort_type = type;
    $scope.page = p;
    
    var serach_params = {};
    serach_params.target_id = $stateParams.user_id;
    serach_params.user_id = $scope.user.user_id;
    serach_params.token = $scope.user.token;
    serach_params.keyword = $stateParams.keyword;
    serach_params.p = p;
    
    if(type == "user"){
      call_func = 'get_table_list_by_user';
    }else if(type == "owner"){
      call_func = 'get_table_list_by_table_owner';
    }else if(type == "date"){
      call_func = 'get_table_list_by_date';
    }else if(type == "famous"){
      call_func = 'get_table_list_by_famous';
    }else if(type == "star"){
      call_func = 'get_table_list_by_star';
    }else if(type == "cust"){
      serach_params.sex = $stateParams.sex;
      serach_params.native = $stateParams.native;
      serach_params.age = $stateParams.age;
      serach_params.district = $stateParams.district;
      serach_params.date_from = $stateParams.date_from;
      serach_params.date_to = $stateParams.date_to;
      call_func = 'get_table_list_by_search';
    }else{
      call_func = 'get_table_list_by_date';
    }
    fetchPostData('user', call_func, serach_params, function(result){
      $scope.isLoading.event_list = false;
      $scope.isLoading.loadMore = false;
      console.log(result);
      if(p == 0){
        $scope.recent_events = [];
      }
      
      $timeout(function(){
        if(result.retcode == 0){
          if(result.user_table_list.length == 0){
            if(p == 0){
              $scope.hasEvent = false;
            }
            $scope.noMoreItemsAvailable = true;
          }else{
            $scope.noMoreItemsAvailable = result.noMoreItemsAvailable || false;
            $scope.hasEvent = true;
            $.each(result.user_table_list, function(i, event){
              //data converting
              $scope.fetchEventInfo(event);
              $scope.recent_events.push(event);
            });
              
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$apply();
            
            //console.log($scope.recent_events);
          }
        }else if(result.retcode == 2){
          //$scope.showLogin();
        }
        //console.log($scope);
        $timeout(function(){
          //$ionicScrollDelegate.scrollTop(true);
        });
      });
    });
  };
  
  $scope.loadMore = function(type, ul){
      $scope.page++;
      $scope.get_table_list($scope.sort_type, $scope.page);
  };
  
  $scope.toggleTableDetials = function(event, forceWarning){
    
    var showWarningBeforeEnter = false;
    event.check = {};
    
    if(event.sex_include == null || event.sex_include == $scope.user_info.sex){
      event.check.validSex = true;
    }else{
      event.check.validSex = false;
    }
    
    if(event.age_include == null || event.age_include == $scope.user_info.age){
      event.check.validSex = true;
    }else{
      event.check.validAge = false;
    }
    
    if(event.native_include == null || event.native_include == $scope.user_info.native){
      event.check.validNative = true;
    }else{
      event.check.validNative = false;
    }
    
    if(event.native_include == null || event.native_include == $scope.user_info.native){
      event.check.validNative = true;
    }else{
      event.check.validNative = false;
    }
    
    if(event.user_lv_include == 0 || event.user_lv_include < $scope.user_info.user_lv){
      event.check.validUserLv = true;
    }else{
      event.check.validUserLv = false;
    }
    
    if(event.points_include == 0 || event.points_include < $scope.user_info.user_points){
      event.check.validUserPoints = true;
    }else{
      event.check.validUserPoints = false;
    }
    
    if(event.likes_include == 0 || event.likes_include < $scope.user_info.like_cnt){
      event.check.validLikeCnt = true;
    }else{
      event.check.validLikeCnt = false;
    }
    
    if(event.dislike_exclude == 0 || event.dislike_exclude < $scope.user_info.dislike_cnt){
      event.check.validDisikeCnt = true;
    }else{
      event.check.validDisikeCnt = false;
    }
    
    if(!event.isEnded && !event.isDeadlined){
      event.check.goodEventDate = true;
    }else{
      event.check.goodEventDate = false;
    }
    
    if(event.isAddressPublic){
      event.check.addressPublic = true;
    }else{
      event.check.addressPublic = false;
    }
    
    event.cfg = UserService.get_cfg(event.table_id, {});
    event.cfg.isRead == null ? event.cfg.isRead = false : "";
    
    $scope.ev = event;
    
    $.each(event.check, function(key, value){
      if(value == false){
        $scope.showWarningBeforeEnter = true;
      }
    });
      
    console.log(event);
    
    if(forceWarning && $scope.showWarningBeforeEnter){
      //show warning
    }else if(forceWarning && !$scope.showWarningBeforeEnter){
      $scope.showToast("沒有活動提示訊息","short","center");
    }else if(event.cfg.isRead || event.isTableOwner){
      $scope.enterEvent(event);
    }else if(!$scope.showWarningBeforeEnter && !event.isBlacklisted && event.isEnterable){
      $scope.enterEvent(event);
    }
  };
  
  $scope.eventIsRead = function(event){
    event.cfg.isRead = !event.cfg.isRead;
    UserService.save_cfg(event.table_id, event.cfg);
  };
  
  $scope.toogleListView = function(){
    $scope.listView = !$scope.listView;
    UserService.save_cfg('listView', $scope.listView);
    $ionicScrollDelegate.scrollTop(true);
  };
  
  $scope.enterEvent = function(event){
    $scope.showWarningBeforeEnter = false;
    $state.go("tab.event", {'table_id':event.table_id},{'reload':true});
    $rootScope.hideTabs = true;
  };
  
  $scope.editEvent = function(event){
    $state.go("tab.editEvent", {'table_id':event.table_id});
  };
});