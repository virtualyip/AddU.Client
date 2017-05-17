angular.module('come_rice.eventDetail.ctrl', [])

.controller('EventDetailCtrl', function($scope, $rootScope, $state, $ionicModal, UserService, 
  $timeout, $stateParams, $ionicHistory, $ionicSideMenuDelegate) {
  
  $ionicModal.fromTemplateUrl('new-apply.html', function(modal) {
    $scope.applyModal = modal;
  }, {
    scope: $scope
  });
  
  $scope.$on('loggedIn', function() {
    $scope.user = UserService.get();
    $scope.user_info = UserService.get_info();
    console.log($scope.user);
    if($scope.user.user_id != null && $scope.user.token != null){
      $scope.tableDetailsInit();
    }
  });
  
  $scope.tableDetailsRefresh = function(callback){
    if($stateParams.table_id != 0){
      $scope.user = UserService.get();
      $scope.user_info = UserService.get_info();
      
      table_details_params = {};
      table_details_params['table_id'] = $stateParams.table_id;
      table_details_params['user_id'] = $scope.user.user_id;
      table_details_params['token'] = $scope.user.token;

      fetchPostData('table', 'get_table_info', table_details_params, function(result){
        console.log(result);
        $timeout(function() {
          if(result.retcode == 1 || result.retcode == 2){
            //$scope.showToast("請先登入","short","center");
            //$scope.showLogin("reload", {});
            //$scope.user.logined = false;
            $scope.showTableDetials = false;
          }else if(result.retcode == 0){
            //$scope.user.logined = true;
            $scope.showTableDetials = true;
            $scope.fetchEventInfo(result.table_info);
            $scope.fetchEventImage(result.table_info);
            $scope.table_details = result.table_info;
            //$ionicSideMenuDelegate.toggleRight();
            callback != null ? callback() : "";
          }else{
            //$scope.user.logined = false;
            $scope.showTableDetials = false;
            $scope.showToast("出錯了","short","center");
          } 
        });
        //console.log($scope.user);
      });
    }
  };
  
  $scope.tableDetailsInit = function(){
    //app instruction
    instruction = UserService.get_cfg("instruction", {});
    if(instruction.details == null || instruction.details == false){
      $scope.openInstructionModal("instruction/details.png");
      instruction.details = true;
      instruction = UserService.save_cfg("instruction", instruction);
    }
    
    $scope.showTableDetials = true;
    $rootScope.hideTabs = true;
    $scope.user = {};
    $scope.table_details = {};
    $scope.table_user_list = {};
    $scope.involve = {};
    
    $scope.userTableRelation = "";
    
    $scope.tableDetailsRefresh(function(){
      $scope.tableUserListRefresh();
    });
  };
  $scope.tableDetailsInit();
  
  $scope.tableUserListRefresh = function(){
    if($stateParams.table_id != 0){
      $scope.user = UserService.get();
      
      table_details_params = {};
      table_details_params['table_id'] = $stateParams.table_id;
      table_details_params['user_id'] = $scope.user.user_id;
      table_details_params['token'] = $scope.user.token;
      
      $scope.isUserListLoading = true;
      fetchPostData('table', 'get_table_involvement_user_list', table_details_params, function(result){
        console.log(result);
        if(result.retcode == 1){
          $scope.showToast("請先登入","short","center");
          //$scope.showLogin("reload", {});
        }else if(result.retcode == 0){
          $timeout(function() {
            $scope.user_role = "";
            $.each(result.involvement_user_list, function(i, table_user){
              $scope.fetchTableUser(table_user);
              
              if($scope.user.user_id == table_user.user_id){
                $scope.user_role = table_user.role;
                $scope.user_role_desc = table_user.role_desc;
                $scope.user_involve_id = table_user.involve_id;
                $scope.involve.involve_title = table_user.involve_title;
                $scope.involve.involve_content = table_user.involve_content;
                $scope.involve.involve_member_cnt = table_user.member_cnt;
                console.log($scope.user_role);
              }
            });
            
            $scope.table_user_list = result.involvement_user_list;
            //console.log($scope.table_user_list);
            
            //update last apply and follow read time
            event_cfg = UserService.get_cfg($stateParams.table_id,{});
            event_cfg.last_follow = $scope.table_details.last_follow;
            event_cfg.last_apply = $scope.table_details.last_apply;
            UserService.save_cfg($stateParams.table_id, event_cfg);
            
            //update table info in case user role changed
            $scope.tableDetailsRefresh();
          });
        }else if(result.retcode == 1){
          if(result.msg_id == 0){
            $scope.showToast("輸入錯誤","short","center");
          }else{
            $scope.showToast("沒有足夠權限","short","center");
          }
        }else if(result.retcode == 2){
          $scope.showToast("請先登入","short","center");
        }else{
          $scope.showToast("系統繁忙","short","center");
        }
        $scope.isUserListLoading = false;
      });
    }
  };
  
  $scope.followTableInDetail = function(event){
    $scope.followTable(event, function(){
      $scope.tableDetailsInit();
    });
  };
  
  $scope.toggleTableDetials = function(){
    $scope.showTableDetials = !$scope.showTableDetials;
  };
  
  $scope.toggleTableUpdate = function(table_id){
    if($scope.user_role == 'leader'){
      $state.go("tab.editEvent", {'table_id':table_id});
    }
  };
  
  $scope.newTableApplication = function(){
    $scope.user = UserService.get();
    if($scope.user.user_id != null){
      $scope.applyModal.show();
    }else{
      $scope.showLogin();
    }
  };
  
  $scope.closeTableApplication = function(){
    $scope.applyModal.hide();
  };
  
  $scope.tableApplication = function(involve, type){
    $scope.user = UserService.get();
    involve['table_id'] = $scope.table_details.table_id;
    involve['involve_receiver_id'] = $scope.table_details.user_id;
    involve['involve_sender_id'] = $scope.user.user_id;
    involve['token'] = $scope.user.token;
    involve['involve_type'] = 'apply';
    involve['involve_reply_deadline'] = '2100-12-31 00:00:00';

    
    if(type == "create" || type == "update"){
      console.log(involve);
      fetchPostData('table', 'table_involve', involve, function(result){
        console.log(result);
        $timeout(function(){
          if(result.retcode == 0){
            $scope.showToast("成功傳送申請","long","center");
            $scope.tableUserListRefresh();
            $scope.closeTableApplication();
          }else if(result.retcode == 1){
            if(result.msg_id == 0){
              $scope.showToast("輸入錯誤","short","center");
            }else{
              $scope.showToast("沒有足夠權限","short","center");
            }
          }else if(result.retcode == 2){
            $scope.showToast("請先登入","short","center");
          }else{
            $scope.showToast("系統繁忙","short","center");
          }
        }, 1000);
      });
    }
  };
  
  $scope.tableInvitement = function(involved_user, type){
    $scope.user = UserService.get();
    involve = {};
    involve['table_id'] = $scope.table_details.table_id;
    involve['involve_receiver_id'] = involved_user.user_id;
    involve['involve_sender_id'] = $scope.user.user_id;
    involve['token'] = $scope.user.token;
    involve['involve_type'] = 'invite';
    involve['involve_title'] = '歡迎加入';
    involve['involve_reply_deadline'] = '2100-12-31 00:00:00';

    if(type == "create" || type == "update"){
      console.log(involve);
      fetchPostData('table', 'table_involve', involve, function(result){
        console.log(result);
        $timeout(function(){
          if(result.retcode == 0){
            closeTableApplication();
            $scope.tableUserListRefresh();
            $scope.showToast("成功傳送申請","long","center");
          }else if(result.retcode == 1 && result.msg_id == 0){
            $scope.showToast("傳誤輸入，請檢查","long","center");
          }else if(result.retcode == 2){
            //$scope.showLogin("");
          }else{
            $scope.showToast("稍後重試","long","center");
          }
        });
      });
    }
  };
  
  $scope.cancelInvolvement = function(type, involve_id) {
    $scope.user = UserService.get();
    cancel_involvement_params = {};
    cancel_involvement_params['involve_sender_id'] = $scope.user.user_id;
    cancel_involvement_params['token'] = $scope.user.token;
    cancel_involvement_params['involve_id'] = involve_id;
    cancel_involvement_params['involve_type'] = type;
    console.log(cancel_involvement_params);
    
    fetchPostData('table', 'table_involve_cancel', cancel_involvement_params, function(result){
      console.log(result);
      $timeout(function() {
        if(result.retcode == 0){
          $scope.tableUserListRefresh();
          $scope.showToast("成功取消","long","center");  
        }else if(result.retcode == 1 && result.msg_id == 0){
          $scope.showToast("傳誤輸入，請檢查","long","center");
        }else if(result.retcode == 2){
          //$scope.showLogin("");
        }else{
          $scope.showToast("稍後重試","long","center");
        }
      }, 500);
    });
  };
  
  $scope.cancelTable = function(table_id) {
    $scope.user = UserService.get();
    cancel_table_params = {};
    cancel_table_params['user_id'] = $scope.user.user_id;
    cancel_table_params['token'] = $scope.user.token;
    cancel_table_params['table_id'] = table_id;
    console.log(cancel_table_params);
    
    fetchPostData('table', 'table_cancel', cancel_table_params, function(result){
      console.log(result);
      $timeout(function() {
        if(result.retcode == 0){
          $scope.tableUserListRefresh();
        }else{
          $scope.showToast("稍後重試","long","center");
        }
      });
    });
  };
  
  $scope.groupTable = function(table_id){
    $scope.user = UserService.get();
    group_table_params = {};
    group_table_params['user_id'] = $scope.user.user_id;
    group_table_params['token'] = $scope.user.token;
    group_table_params['table_id'] = table_id;
    console.log(group_table_params);
    
    fetchPostData('table', 'table_grouping', group_table_params, function(result){
      console.log(result);
      $timeout(function() {
        if(result.retcode == 0){
          $scope.showToast("己組成", "long", "center");
          $scope.table_details.group_id = result.group_team_id;
        }else if(result.retcode == 1){
          if(result.msg_id == 0){
            $scope.showToast("未有組員", "long", "center");
          }else if(result.msg_id == 1){
            $scope.showToast("請先解散再組", "long", "center");
          }
        }else{
          $scope.showToast("稍後再試", "long", "center");
        }
      }, 500);
    });
  };
  
  $scope.ungroupTable = function(table_id, group_team_id){
    $scope.user = UserService.get();
    ungroup_table_params = {};
    ungroup_table_params['user_id'] = $scope.user.user_id;
    ungroup_table_params['token'] = $scope.user.token;
    ungroup_table_params['table_id'] = table_id;
    ungroup_table_params['group_team_id'] = group_team_id;
    console.log(ungroup_table_params);
    
    fetchPostData('table', 'table_ungrouping', ungroup_table_params, function(result){
      console.log(result);
      $timeout(function() {
        if(result.retcode == 0){
        }
      }, 500);
    });
  };
  
  $scope.goBack = function(){
    $rootScope.hideTabs = false;
    $ionicHistory.goBack();
  };
});
