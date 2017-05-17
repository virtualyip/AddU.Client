angular.module('come_rice.profile.ctrl', [])

.controller('ProfileCtrl', function($scope, $rootScope, $state, $ionicModal, $ionicPopup, 
  $stateParams, $timeout, $cordovaCamera, $ionicPopover, UserService, $jrCrop) {
  
  $scope.$on('loggedIn', function() {
    $scope.user = UserService.get();
    $scope.user_info = UserService.get_info();
    if($scope.user.user_id != null && $scope.user.token != null){
      $stateParams.user_id = $scope.user.user_id;
      $scope.profileInit();
    }
  });
  
  $scope.$on('loggedOut', function() {
    $scope.profileInit();
  });
  
  $scope.userInfoRefresh = function(){
    $scope.user = UserService.get();
    user_params = {};
    user_params['user_id'] = $stateParams.user_id;
    user_params['qurier_id'] = $scope.user.user_id;
    user_params['token'] = $scope.user.token;
    
    if($stateParams.user_id == $scope.user.user_id){
      call_func = 'get_user_info';
    }else{
      call_func = 'get_user_public_info';
    }
    
    $scope.isUserInfoLoading = true;
    fetchPostData('user', call_func, user_params, function(result){
      if(result.retcode == 0){
        $scope.fetchUserInfo(result.user_info);
        $scope.user_info = result.user_info;
        
        console.log($scope.user_info);
        //$scope.userNetworkRefresh();
      }else if(result.retcode == 2){
        $scope.logined = false;
        UserService.clear();
      }else{
        $scope.showToast("系統繁忙","short","center");
      }
      $scope.isUserInfoLoading = false;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };
  
  /*
  $scope.userNetworkRefresh = function(){
    user_params = {};
    user_params['user_id'] = $stateParams.user_id;
    
    $scope.isUserInfoLoading = true;
    fetchPostData('user', 'get_user_network_summary', user_params, function(result){
      $timeout(function(){
        if(result.retcode == 0){
          console.log(result.user_network_summary);
          $.each(result.user_network_summary, function(key, value){
            if(value == null) 
              result.user_network_summary[key] = 0;
          });
          $scope.user_network_info = result.user_network_summary;
        }
        $scope.isUserInfoLoading = false;
        $scope.$broadcast('scroll.refreshComplete');
      });
    });
  };
  */
 
  $scope.profileInit = function(){
    //app instruction
    instruction = UserService.get_cfg("instruction", {});
    if(instruction.profile == null || instruction.profile == false){
      $scope.openInstructionModal("instruction/profile.png");
      instruction.profile = true;
      instruction = UserService.save_cfg("instruction", instruction);
    }
    
    $rootScope.hideTabs = false;
    
    $scope.user = UserService.get();
    $scope.user_info = {};
    $scope.update = {};
    $scope.user_network_info = {};
    $scope.user_comment_info = {};
    $scope.user_comment_list = {};
    
    $scope.temp = {};
    console.log($stateParams.user_id );
    $scope.user_id = $stateParams.user_id;
    if($stateParams.user_id == null || $stateParams.user_id == ''){
      $scope.logined = false;
    }else{
      $scope.logined = true;
      $scope.userInfoRefresh();
    }
  };
  $timeout(function(){$scope.profileInit();});
  
  $scope.fetchUserInfo = function(user_info){
    
    var img_src = img_url+"?request=get_user_icon&user_id="+user_info.user_id;            
    user_info.img_src = img_src;
    $scope.temp.img_src = img_src;
    
    user_info.follow_cnt = user_info.follow_cnt || 0;
    user_info.fans_cnt = user_info.fans_cnt || 0;
    user_info.blacklist_cnt = user_info.blacklist_cnt || 0;
    user_info.blocked_cnt = user_info.blocked_cnt || 0;
    
    $scope.user = UserService.get();
    if(user_info.user_id != $scope.user.user_id){
      user_info.isYourself = false;
    }else{
      user_info.isYourself = true;
    }
    
    if(user_info.sex == null){
      user_info.sex_text = "姓別保密";
    }else{
      switch(user_info.sex){
        case 'm': user_info.sex_text = "男姓";
                  break;
        case 'f': user_info.sex_text = "女姓";
                  break;
        default: user_info.sex_text = "?";
      }
    }

    if(user_info.age_group == null){
      user_info.age_group_text = "年齡保密";
    }else{
      switch(user_info.age_group){
        case 'teenager': user_info.age_group_text = "青少年";
                  break;
        case 'middleage': user_info.age_group_text = "中年";
                  break;
        case 'elderly': user_info.age_group_text = "長輩";
                  break;
        default: user_info.age_group_text = "?";
      }
    }
    
    if(user_info.native == null){
      user_info.native_text = "國藉保密";
    }else{
      switch(user_info.native){
        case 'hk': 
          user_info.native_text = "香港人";
          break;
        case 'cn': 
          user_info.native_text = "中國人";
          break;
        case 'asia': 
          user_info.native_text = "亞州人";
          break;
        case 'ot': 
          user_info.native_text = "其他";
          break;
        default:
          user_info.native_text = "其他?";
      }
    }
    /*
    if(result.user_info.education == null){
      $scope.user_info.education_text = "學歷保密";
    }else{
      switch(result.user_info.education){
        case 'university': 
          $scope.user_info.education_text = "大學";
          break;
        case 'it': 
          $scope.user_info.education_text = "科技";
          break;
        default:
          $scope.user_info.education_text = "?";
      }
    }
    if($scope.user_info.work_type == null){
      $scope.user_info.work_type_text = "職業保密";
    }else{
      switch($scope.user_info.work_type){
        case 'student': 
          $scope.user_info.work_type_text = "大學生";
          break;
        case 'tech': 
          $scope.user_info.work_type_text = "科技";
          break;
        case 'design': 
          $scope.user_info.work_type_text = "設計";
          break;
        case 'fn': 
          $scope.user_info.work_type_text = "金融／地產";
          break;
        default:
          $scope.user_info.work_type_text = "?";
      }
    }
    */
  };
  
  $scope.showUserNetworkList = function(user_info, type, p){
    $scope.p = p;
    $scope.network_type = type;
    $scope.userNetworkListModal.show();
    $scope.user = UserService.get();
    
    userNetworkParams = {};
    userNetworkParams['p'] = p;
    userNetworkParams['querier_id'] = $scope.user.user_id;
    userNetworkParams['token'] = $scope.user.token;
    if(type == 'follow'){
      userNetworkParams['network_type'] = 'follow';
      userNetworkParams['user_id_from'] = user_info.user_id;
    }else if(type == 'blacklist'){
      userNetworkParams['network_type'] = 'blacklist';
      userNetworkParams['user_id_from'] = user_info.user_id;
    }else if(type == 'fans'){
      userNetworkParams['network_type'] = 'follow';
      userNetworkParams['user_id_to'] = user_info.user_id;
    }else if(type == 'blocked'){
      userNetworkParams['network_type'] = 'blacklist';
      userNetworkParams['user_id_to'] = user_info.user_id;
    }
    
    $scope.isNetworkListLoading = true;
    fetchPostData('user', 'get_user_network_list', userNetworkParams, function(result){
      $timeout(function(){
        if(result.retcode == 0){
          //init list and prepare to fetch next page
          $scope.p == 0 ? $scope.user_network_list = [] : '';
          $scope.p++;
          
          if(result.user_network_list.length > 0){
            $.each(result.user_network_list, function(i, network_info){
              
              //convert target user id
              if(type == 'follow' || type == 'blacklist'){
                network_info.user_id = network_info.user_id_to;
              }else if(type == 'fans' || type == 'blocked'){
                network_info.user_id = network_info.user_id_from;
              }        
              
              //get user icon
              var img_src = img_url+"?request=get_user_icon&user_id="+network_info.user_id;
              network_info.img_src = img_src;
              
              $scope.user_network_list.push(network_info);
            });
          }
          $scope.noMoreItemsAvailable = parseInt(result.noMoreItemsAvailable) || 1;
        }else if(result.retcode == 2){
          $scope.logined = false;
        }else{
          $scope.showToast("系統繁忙","short","center");
        }
        $scope.isNetworkListLoading = false;
        console.log($scope.user_network_list);
      });
    });
  };
  
  $scope.deleteUserNetwork = function(user_info, type){
    $ionicPopup.confirm({
      title: '確定移除？',
      template: '確定移除？'
    }).then(function(res) {
      if(res) {
        $scope.updateUserNetwork(user_info, type);
      }
    });
  };
  
  $scope.updateUserNetwork = function(user_info, type){
    $scope.user = UserService.get();
    userNetworkParams = {};
    if(type == 'add'){
      userNetworkParams['user_id_from'] = $scope.user.user_id;
      userNetworkParams['user_id_to'] = user_info.user_id;
    }else if(type == 'remove'){
      userNetworkParams['user_id_from'] = user_info.user_id_from;
      userNetworkParams['user_id_to'] = user_info.user_id_to;
    }
    userNetworkParams['querier_id'] = $scope.user.user_id;
    userNetworkParams['token'] = $scope.user.token;
    userNetworkParams['network_type'] = 'follow';
    userNetworkParams['action'] = type;
    //user_network
    
    $scope.user_info.isNetworkUpdating = true;
    fetchPostData('user', 'user_network', userNetworkParams, function(result){
      $timeout(function(){
        if(result.retcode == 0){
          $scope.showToast('已成功更新','short','center');
          user_info.isDeleted = true;
          $scope.userInfoRefresh();
        }else if(result.retcode == 1 && result.msg_id == 0){
          $scope.showToast('請先登入','short','center');
        }else if(result.retcode == 1 && result.msg_id == 2){
          $scope.showToast('已更新','short','center');
        }else if(result.retcode == 2){
          $scope.logined = false;
        }else{
          $scope.showToast('系統繁忙','short','center');
        }
        $scope.user_info.isNetworkUpdating = false;
      });
    });
  };
  
  $scope.loadMore = function(p){
    $scope.showUserNetworkList(user_info, type, p);
  };
  
  $scope.changeProfile = function(user_info){
    $scope.userNetworkListModal.hide();
    $scope.openUserNamecard(user_info.user_id);
  };
  
  $scope.closeUserNetworkList = function(){
    $scope.userNetworkListModal.hide();
  };
  
  $scope.removeNetwork = function(network_info){
    
  };
  
  $scope.toggleCommentList = function(){
    $scope.showCommentList = true;
    $scope.showUserSetting = false;
    $scope.showUserRight = false;
    
    fetchPostData('user', 'get_user_comment_summary', $scope.user, function(result){
      if(result.retcode == 0){
        console.log(result.user_comment_summary);
        $.each(result.user_comment_summary, function(key, value){
          if(value == null) 
            result.user_comment_summary[key] = 0;
        });
        $scope.user_comment_info = result.user_comment_summary;
      }
    });
    
    fetchPostData('user', 'get_user_comment_list', $scope.user, function(result){
      if(result.retcode == 0){
        $scope.hasComment = false;
        if(result.user_comment_list.length > 0){
          $scope.hasComment = true;
          $.each(result.user_comment_list, function(i, comment_info){
            //get user icon
            var img_src = img_url+"?request=get_user_icon&user_id="+comment_info.user_id;            
            comment_info.img_src = img_src;
            //assign display value
            comment_info.comment_type == 1 ? comment_info.comment_type = "正":"";
            comment_info.comment_date = comment_info.comment_date.substr(0,10);
            comment_info.addReply = false;
            if(comment_info.comment_replied_date != null){
              comment_info.hasCommentReplied = true;
              comment_info.comment_replied_date = comment_info.comment_replied_date.substr(0,10);
            }else{
              comment_info.hasCommentReplied = false;
            }
          });
          console.log(result);
          $scope.user_comment_list = result.user_comment_list;
        }
      }
    });
  };
  
  $scope.toggleReply = function(comment_info){
    comment_info.addReply = true;
  };
  
  $scope.createReply = function(comment_info){
    console.log(comment_info);
    if(comment_info.reply == null){
      $scope.showAlert('請重新確認','<h4>請輸入[回應]內容</h4>');
    }else{
      //submit
      
      $scope.toggleCommentList();
    }
  };
  
  $scope.openUpdateInfo = function(){
    $scope.user = UserService.get();
    if($scope.user.user_id == $stateParams.user_id){
      $scope.update.nickname = $scope.user_info.nickname;
      $scope.update.login_pw = null;
      $scope.update.login_pw_confirm = null;
      $scope.userUpdateInfoModal.show();
    }
  };
  
  $scope.closeUpdateInfo = function(){
    $scope.userUpdateInfoModal.hide();
  };
  
  
  $scope.userUpdateSubmit = function(user_info) {
    
    var userUpdateParams = jQuery.extend(true, {}, user_info);
    
    if($scope.update.nickname != $scope.user_info.nickname && $scope.update.nickname != null){
      if(/^[0-9]*$/.test($scope.update.nickname)){
        $scope.showToast("稱乎不能全數字","short","center");
        return;
      }else if(/[~`!@#$%^&*({}|;:'"<,>.\/\?\)\-\_\=\+\[\]\\]/.test($scope.update.nickname)){
        $scope.showToast("稱乎不能有符號","short","center");
        return;
      }else if(stringBytes($scope.update.nickname) < 2){
        $scope.showToast("稱乎過短","short","center");
        return;
      }else if(stringBytes($scope.update.nickname) > 12){
        $scope.showToast("稱乎過長","short","center");
        return;
      }
      userUpdateParams.nickname = $scope.update.nickname;
    }else{
      delete userUpdateParams.nickname;
    }
    //user_info.nickname = $scope.update.nickname;
    
    delete userUpdateParams.login_id;
    if($scope.update.login_pw != null){
      if(/^[a-zA-Z0-9]*$/.test($scope.update.login_pw) == false){
        $scope.showToast("登入密碼只接受英文或數字","short","center");
        return;
      }else if($scope.update.login_pw.length < 6){
        $scope.showToast("登入密碼過短","short","center");
        return;
      }else if($scope.update.login_pw.length > 15){
        $scope.showToast("登入密碼過長","short","center");
        return;
      }else if($scope.update.login_pw != $scope.update.login_pw_confirm){
        $scope.showToast("密碼不相同","short","center");
        return;
      }else{
        userUpdateParams.login_pw = $scope.update.login_pw;
      }
    }
    
    $scope.user = UserService.get();
    userUpdateParams.token = $scope.user.token;
    
    //$.each(userUpdateParams, function(k,v){console.log(k,v);});
    fetchPostData('user', 'user_update', userUpdateParams, function(result){
      $timeout(function() {
        console.log(result);
        if(result.retcode == 0){
          UserService.save(result.user);
          $scope.getUserInfo(function(){
            $scope.showToast("更新成功","short","center");
            $scope.user_info = UserService.get_info();
            $scope.fetchUserInfo($scope.user_info);
            $scope.closeUpdateInfo();
          });
        }else if(result.retcode == 1 && result.msg_id == 10){
          $scope.showToast("稱乎已被㤦用","short","center");
        }else if(result.retcode == 2){
          $scope.logined = false;
        }else{
          $scope.showToast("更新失敗","short","center");
        }
      });
    });
  };
  
  $ionicPopover.fromTemplateUrl('user-icon.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });
  $scope.openPopover = function($event, user_info) {
    $scope.user = UserService.get();
    if(user_info.user_id == $scope.user.user_id){
      $scope.popover.show($event);
      $scope.user_info = user_info;
    }
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  
  $ionicModal.fromTemplateUrl('user-networklist.html', function(modal) {
    $scope.userNetworkListModal = modal;
  }, {
    scope: $scope
  });
  
  $ionicModal.fromTemplateUrl('user-updateInfo.html', function(modal) {
    $scope.userUpdateInfoModal = modal;
  }, {
    scope: $scope
  });
  
  $scope.takePic = function(type) {
    if(!$rootScope.isMobile){
      $scope.showToast("只限手機Apps使用","short","center");
      return;
    }
    var options =   {
        quality: 50,
        allowEdit : false,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: type,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
        encodingType: 0,     // 0=JPG 1=PNG
        correctOrientation: true
    };
    // Take picture using device camera and retrieve image as base64-encoded string
    $cordovaCamera.getPicture(options).then(function(imageData) {
      $scope.showToast("成功選取","short","center");
      $jrCrop.crop({
          url: "data:image/jpeg;base64," +imageData,
          width: 300,
          height: 300,
          title: '請選擇範圍'
      }).then(function(canvas) {
          // success!
          var image = canvas.toDataURL();
          $scope.user_info.user_icon = image;
          $scope.temp.img_src = image;
          $scope.user_info.user_icon_upt = 1;
          $timeout(function() {$scope.$apply();});
          
          $scope.userUpdateSubmit($scope.user_info);
          //$scope.userIconUpdate(imageData);
      }, function() {
          // User canceled or couldn't load image.
          $scope.showToast("請重新再試","short","center");
      });
    }, function(err) {
      //$scope.showToast("請重新再試","short","center");
    });
  };
  
  $scope.userIconUpdate = function(imageData){
    $scope.user = UserService.get();
    userUpdateParams = {};
    userUpdateParams['user_id'] = $scope.user.user_id;
    userUpdateParams['token'] = $scope.user.token;
    userUpdateParams['user_icon'] = imageData;
    userUpdateParams['user_icon_upt'] = true;
    
    //$.each(userUpdateParams,function(k,v){console.log(k,v);});
    $scope.temp.img_src = "img/loading.gif";
    fetchPostData("user","user_update",userUpdateParams,function(result){
      
      $.each(result,function(k,v){console.log(k,v);});
      if(result.retcode == 0){
        $scope.showToast("更新成功","short","center");
      }else if(result.retcode == 2){
          $scope.logined = false;
      }else{
        $scope.temp.img_src = "img/user-default.jpg";
        $scope.showToast("更新失敗，請再嘗試","short","center");
      }
    });
  };
  
  $scope.deletePic = function(){
    $ionicPopup.confirm({
      title: '確定移除圖片？',
      template: '確定移除圖片？'
    }).then(function(res) {
      if(res) {
        $scope.temp.img_src = "img/user-default.jpg";
        $scope.userIconUpdate(null);
      }
    });
  };
  
    // An alert dialog
   $scope.showAlert = function(title, message) {
     var alertPopup = $ionicPopup.alert({
       title: title,
       template: message
     });
     $timeout(function() {
       alertPopup.close();
     }, 10000);
   };
});