angular.module('come_rice.home.ctrl', [])

.controller('HomeCtrl', function($scope, $rootScope, $state, $stateParams, UserService, 
      $timeout, $ionicScrollDelegate) {
  
  $scope.$on('loggedIn', function() {
    $scope.user = UserService.get();
    $scope.user_info = UserService.get_info();
    if($scope.user.user_id != null && $scope.user.token != null){
      $scope.user.logined = true;
    }
  });
  
  $scope.homeInit = function(){
    //app instruction
    instruction = UserService.get_cfg("instruction", {});
    if(instruction.home == null || instruction.home == false){
      $scope.openInstructionModal("instruction/home.png");
      instruction.home = true;
      instruction = UserService.save_cfg("instruction", instruction);
    }
    
    // Load or initialize projects
    $scope.user = UserService.get();
    $scope.user_info = UserService.get_info();
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
      if($scope.user.user_id != null){
        $scope.user.logined = true;
        $scope.get_table_list('user', $scope.page);
        $scope.sort_type = 'user';
      }else{
        $scope.user.logined = false;
        $scope.get_table_list('date', $scope.page);
        $scope.sort_type = 'date';
      }
    }
  };
  $timeout(function(){$scope.homeInit();});
  
  $scope.get_table_list = function(type, p){  
    $scope.user = UserService.get();
    $(".search_tabs .button").removeClass("button-positive");
    $(".search_tabs .button."+type).addClass("button-positive");
    $scope.sort_type = type;
    $scope.page = p;
    
    $scope.listView = UserService.get_cfg('listView');
    
    var serach_params = {};
    serach_params.user_id = $scope.user.user_id;
    serach_params.token = $scope.user.token;
    serach_params.keyword = $stateParams.keyword;
    serach_params.p = p;
    
    serach_params.sex = $stateParams.sex;
    serach_params.native = $stateParams.native;
    serach_params.age = $stateParams.age;
    serach_params.district = $stateParams.district;
    serach_params.date_from = $stateParams.date_from;
    serach_params.date_to = $stateParams.date_to;
    
    if(type == "user"){
      serach_params.last_query_date = UserService.get_cfg('last_query_date', '1900-01-01 00:00:00');
      call_func = 'get_table_list_by_user';
    }else if(type == "new"){
      call_func = 'get_table_list_by_created_date';
    }else if(type == "date"){
      call_func = 'get_table_list_by_date';
    }else if(type == "famous"){
      call_func = 'get_table_list_by_famous';
    }else if(type == "star"){
      call_func = 'get_table_list_by_star';
    }else if(type == "cust"){
      call_func = 'get_table_list_by_search';
    }else{
      call_func = 'get_table_list_by_date';
    }
    
    console.log(serach_params);
    p == 0 ? $scope.isLoading.event_list = true : $scope.isLoading.loadMore = true;
    fetchPostData('user', call_func, serach_params, function(result){
      $timeout(function(){
        console.log(result);
        $scope.isLoading.event_list = false;
        $scope.isLoading.loadMore = false;
        p == 0 ? $scope.recent_events = [] : "";
        
        if(result.retcode == 0){
          //last_query_date update
          UserService.save_cfg('last_query_date', result.date);
          
          if(result.user_table_list.length == 0){
            $scope.showToast("沒有了","short","center");
            $scope.noMoreItemsAvailable = true;
          }else{
            $scope.noMoreItemsAvailable = result.noMoreItemsAvailable || false;
            $.each(result.user_table_list, function(i, event){
              
              //data converting
              $scope.fetchEventInfo(event);
              if(!$scope.listView){
                  $scope.fetchEventImage(event);
              }else{
                  event.img_src = null;
              }
              $scope.recent_events.push(event);
            });
            console.log($scope.recent_events);
              
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $scope.$broadcast('scroll.refreshComplete');
            $scope.$apply();
            
            p == 0 ? $ionicScrollDelegate.scrollTop() :  $scope.showToast(result.user_table_list.length+"個新活動","short","center");
          }
        }else if(result.retcode == 1 || result.retcode == 2){
          $scope.showToast("請先登入","short","center");
          $scope.showLogin();
        }else{
          $scope.showToast("系統繁忙，請稍後再試","short","center");
        }
        //console.log($scope);
      });
    });
  };
  
  $scope.filter_table_list = function(filter){
    $.each($scope.recent_events, function(i, event){
      if(filter == 'owner'){
        event.isTableOwner? event.list_filter = false : event.list_filter = true;
      }else if(filter == 'involve'){
        event.isTableOwner? event.list_filter = true : event.list_filter = false;
      }else{
        event.list_filter = false;
      }
    });
    console.log($scope.recent_events);
  };
  
  $scope.loadMore = function(type, ul){
      $scope.page++;
      $scope.get_table_list($scope.sort_type, $scope.page);
  };
  
  /*
  $scope.search = function(search_keyword){
    if(search_keyword != null){
      if(search_keyword.lenght >= 15){
        search_keyword.substring(0, 15);
      }
      $state.go($state.current, {'keyword':search_keyword});
    }
  };
  */
 
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
    console.log(event.cfg);
    UserService.save_cfg(event.table_id, event.cfg);
  };
  
  $scope.toogleListView = function(){
    $scope.listView = !$scope.listView;
    UserService.save_cfg('listView', $scope.listView);
    $.each($scope.recent_events, function(i, event){
      if(!$scope.listView){
        $scope.fetchEventImage(event);
      }else{
        event.img_src = null;
      }
    });
    $ionicScrollDelegate.scrollTop(true);
  };
  
  $scope.enterEvent = function(event){
    $scope.showWarningBeforeEnter = false;
    $state.go("tab.event", {'table_id':event.table_id});
    $rootScope.hideTabs = true;
  };
  
  $scope.editEvent = function(event){
    $state.go("tab.editEvent", {'table_id':event.table_id});
  };
});