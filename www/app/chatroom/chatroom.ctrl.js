angular.module('come_rice.chatroom.ctrl', [])

.controller('ChatroomCtrl', function($scope, $state, $stateParams, $ionicModal, 
  $ionicScrollDelegate, $timeout, $ionicPopover, $ionicPopup, UserService) {
  
  console.log("ChatroomCtrl");
  $scope.chat_content = "";
  $scope.channel = 'public';
  $scope.chatList = [];
  $scope.chat = {};
  
  
  $ionicPopover.fromTemplateUrl('chat-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });
  $scope.openPopover = function($event, chat_info) {
    $scope.popover.show($event);
    $scope.chat_info = chat_info;
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  
  $scope.chatListUpdate = function(channel, l, u){
    l == null && u == null ? $scope.chatList[channel] = [] : "";
    $scope.noMoreItemsAvailable = true;
    if($stateParams.table_id != null){
      
      $scope.user = UserService.get();
      $scope.getChatParams = {};
      $scope.getChatParams['user_id'] = $scope.user.user_id;
      $scope.getChatParams['token'] = $scope.user.token;
      $scope.getChatParams['table_id'] = $stateParams.table_id;
      $scope.getChatParams['upper_id'] = u;
      $scope.getChatParams['lower_id'] = l;
      
      if(channel == "public"){
        call_func = 'get_chat_msg_by_table';
      }else if(channel == "private"){
        call_func = 'get_chat_msg_by_group';
      }
      
      $scope.isLoading = true; 
      fetchPostData('chat_sys', call_func, $scope.getChatParams , function(result){
        console.log(result);
        $timeout(function(){
          if(result.retcode == 0){
            if(result.chat_info.length > 0){
              
              console.log(result.chat_info);
              
              $.each(result.chat_info, function(i, chat_info){
                var img_src = img_url+"?request=get_user_icon&user_id="+chat_info.chat_from;            
                chat_info.img_src = img_src;
                
                //var d = new Date(chat_info.chat_date);
                //chat_info.chat_date_text = d.getDate() + "/" + (d.getMonth()+1) + " " + ('0'+d.getHours()).slice(-2)+":"+ ('0'+d.getMinutes()).slice(-2);
                chat_info.chat_date_text = $scope.dateToText(chat_info.chat_date);
                $scope.chatList[channel].push(chat_info);
              });
              $scope.chatList[channel].sort(function(x,y) {return new Date(x.chat_date).getTime() - new Date(y.chat_date).getTime();});
              
              if((l == null && u == null) || u != null){
                $ionicScrollDelegate.scrollBottom();
              }
              
              //update last chat read time
              event_cfg = UserService.get_cfg($stateParams.table_id);
              if(channel == 'public')
                event_cfg.last_chat_public = $scope.chatList['public'][$scope.chatList['public'].length-1].chat_id;
              else
                event_cfg.last_chat_private = $scope.chatList['private'][$scope.chatList['private'].length-1].chat_id;
              UserService.save_cfg($stateParams.table_id, event_cfg);
              
            }else{
              $scope.showToast("沒有新留言","short","center");
              $scope.noMoreItemsAvailable = true;
            }
            
          }else if(result.retcode == 1 || result.retcode == 2){
            $scope.showToast("請先登入","short","center");
            //$scope.showLogin("reload", {});
          }else{
            $scope.showToast("出錯了","short","center");
          }
          $scope.$broadcast('scroll.refreshComplete');
          $scope.$apply();
          
          $scope.isLoading = false; 
          $scope.chat = $scope.chatList[channel];
          
        });
      });
      
    }else{
      $state.go("tab.home");
    }
  };
  $scope.chatListUpdate($scope.channel, null, null);
  console.log($scope.chatList);
  
  $scope.loadMore = function(channel, type){
    //console.log($scope.chatList[channel]);
    if($scope.chatList[channel] == null || $scope.chatList[channel].length == 0){
      $scope.chatListUpdate(channel, null, null);
    }else if(type == 'u'){
      u = $scope.chatList[channel][$scope.chatList[channel].length-1].chat_id;
      $scope.chatListUpdate(channel, null, u);
    }else if(type == 'l'){
      l = $scope.chatList[channel][0].chat_id;
      $scope.chatListUpdate(channel, l, null);
    }
  };
  
  $scope.togglePublicChatroom = function(){
    $scope.channel = "public";
    $scope.loadMore($scope.channel, 'u');
  };
  
  $scope.togglePrivateChatroom = function(user_role){
    if(user_role=='leader' || $scope.table_details.isTableMember){
      $scope.channel = "private";
      $scope.loadMore($scope.channel, 'u');
    }else{
      $scope.showToast("請先[申請加入]，成為組員後便能進入","long","center");
    }
  };
  
  $scope.send_msg = function(channel, chat_content){
    if($scope.chat_content != ""){
      $scope.user = UserService.get();
      $scope.sendChatParams = {};
      $scope.sendChatParams['chat_from'] = $scope.user.user_id;
      $scope.sendChatParams['token'] = $scope.user.token;
      $scope.sendChatParams['chat_to'] = $stateParams.table_id;
      $scope.sendChatParams['chat_content'] = $scope.chat_content;
      
      if($scope.channel == "public"){
        call_func = 'chat_new_table_msg';
      }else{
        call_func = 'chat_new_group_msg';
      }
      
      fetchPostData('chat_sys', call_func, $scope.sendChatParams , function(result){
        console.log(result);
        $scope.submitting = true;
        $timeout(function(){
          if(result.retcode == 0){
            if(result.msg_id == 11){
              $scope.showToast("訊息傳送成功","long","center");
              //update content
              $scope.chat_content = "";
              $scope.loadMore($scope.channel, 'u');
            }
          }else if(result.retcode == 1 && result.msg_id == 0){
            $scope.showLogin();
          }else if(result.retcode == 1 || result.retcode == 2){
            //$scope.showLogin('reload');
          }else{
            //$scope.showLogin('tab.home');
          }
          $scope.submitting = false;
        });
      });
    }
  };
  
  $scope.chatReply = function(chat_info){
    if($scope.chat_content.indexOf("@"+chat_info.nickname) >= 0){
      
    }else{
      $scope.chat_content += " @"+chat_info.nickname+" ";
    }
  };
  
  $scope.delete_msg = function(chat_info) {
    var confirmPopup = $ionicPopup.confirm({
      title: '刪除訊息',
      template: '刪除後不能復原'
    });
    confirmPopup.then(function(res) {
      //$scope.popover.hide();
      if(res) {
        $scope.user = UserService.get();
        deleteChatParams = {};
        deleteChatParams['chat_from'] = $scope.user.user_id;
        deleteChatParams['token'] = $scope.user.token;
        deleteChatParams['chat_id'] = chat_info.chat_id;
        
        fetchPostData('chat_sys', 'chat_delete_msg', deleteChatParams , function(result){
          console.log(result);
          $scope.submitting = true;
          $timeout(function(){
            if(result.retcode == 0){
              if(result.msg_id == 11){
                $scope.showToast("訊息刪除成功","long","center");
                //update content
                chat_info.del_flag = 1;
                //$scope.loadMore($scope.channel, 'u');
              }else if(result.retcode == 1 || result.retcode == 2){
              //$scope.showLogin('reload');
            }else{
                //$scope.showLogin('tab.home');
              }
            }
            $scope.submitting = false;
          });
        });
      }
    });
  };
});