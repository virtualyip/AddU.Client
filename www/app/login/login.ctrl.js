angular.module('come_rice.login.ctrl', [])

.controller('LoginCtrl', function($scope, $state, $ionicModal, $timeout, $rootScope, UserService) {
  
  $scope.loginInit = function(){
    $scope.show = false;
    $scope.submitting = false;
    $scope.app_title = "登記你的稱乎";
    $scope.msg = "no msg";
    $scope.reg_info = {};
    $scope.user = {};
    $scope.login = {}; 
    
    $scope.show_reg = false;
    $scope.show_reg_suc = false;
    $scope.show_reg_complete = false;
    
    $scope.user_info = UserService.get_info();
    if($scope.user_info != null && $scope.user_info.user_id != null){
      $scope.show_reg = true;
    }else{
      $scope.getUserInfo(function(){
        $scope.user = UserService.get();
        $scope.user_info = UserService.get_info();
        if($scope.user_info != null && $scope.user_info.user_id != null){
          if($scope.user_info.user_id != null){
            $scope.new_user_nickname = $scope.user_info.nickname;
            $scope.show_reg_suc = true;
            if($scope.user_info.temp_user == 0){
              $scope.show_reg_complete = true;
              $scope.login.login_id = $scope.user_info.login_id;
            }
          }
        }else{
          $scope.show_reg = true;
        }
        //console.log($scope);
      });
    }
  };
  $scope.loginInit();
  
  $scope.loginSubmit = function(login) {
    if(login.login_id == null || login.login_id == ""){
      $scope.showToast("請輸入登入名稱","short","center");
    }else if(login.login_pw == null || login.login_pw == ""){
      $scope.showToast("請輸入登入密碼","short","center");
    }else{
      $scope.submitting = true;
      fetchPostData('user', 'user_login', login, function(result){
        $timeout(function(){
          if(result.retcode == 0){
            UserService.save(result.user);
            $scope.getUserInfo(function(){
              $scope.closeLogin();
            });
          }else if(result.retcode == 1){
            if(result.msg_id == 0){
              $scope.showToast("請輸入登入名稱及密碼","short","center");
            }else if(result.msg_id == 2){
              $scope.showToast("名稱或密碼錯誤","short","center");
            }else if(result.msg_id == 3){
              $scope.showToast("多次錯誤，請一小時後再重試","short","center");
            }else{
              $scope.showToast("系統繁忙中，請稍後再嘗試！","short","center");
            }
          }else{
            $scope.showToast("系統繁忙中，請稍後再嘗試！","short","center");
          }
          $scope.submitting = false;
        }, 1000);
      });
    }
  };
  /*
  $scope.$watch('show', function(newVal, oldVal) {
    if (newVal == false) {
      $scope.closeLoginModal();
    }
  });
          
  $scope.$on('showLogin', function() {
    $scope.userLoginModal.show();
  });
  */
  
  $scope.closeLoginModal = function(){
    $scope.userLoginModal.hide();
  };
  
  $scope.createNewUser = function(new_user_nickname){
    //Submit data
    if(new_user_nickname == null || new_user_nickname.length == 0){
      $scope.showToast("請輸入稱乎","short","center");
    }else if(/[~`!@#$%^&*({}|;:'"<,>.\/\?\)\-\_\=\+\[\]\\]/.test(new_user_nickname)){
      $scope.showToast("稱乎不能有符號","short","center");
    }else if(/^[0-9]*$/.test(new_user_nickname)){
      $scope.showToast("稱乎不能全數字","short","center");
    }else if(stringBytes(new_user_nickname) < 2){
      $scope.showToast("稱呼過短","short","center");
    }else if(stringBytes(new_user_nickname) > 12){
      $scope.showToast("稱呼過長","short","center");
    }else{
      console.log(new_user_nickname);
      $scope.submitting = true;
      fetchPostData('user', 'user_create', {'nickname':new_user_nickname}, function(result){
        console.log(result);
        $timeout(function(){
          if(result.retcode == 0){
            if(result.user.user_id != null && result.user.user_id != null){
              UserService.save(result.user);
              $scope.getUserInfo(function(){
                $scope.user = result.user;
                $scope.show_reg = false;
                $scope.show_reg_suc = true;
                $scope.app_title = "建立你的專有戶口";
              });
            }
          }else if(result.retcode == 1){
            if(result.msg_id == 0){
              $scope.showToast("錯誤輸入！","short","center");
            }else if(result.msg_id == 10){
              $scope.showToast("稱呼己被使用，請轉用其他稱乎！","short","center");
            }else{
              $scope.showToast("系統繁忙中，請稍後再嘗試！","short","center");
            }
          }else{
            $scope.showToast("系統繁忙中，請稍後再嘗試！","short","center");
          }
          $scope.submitting = false;
        }, 1000);
      });
    }
  };
  
  $scope.regSubmit = function(reg_info){
    console.log(reg_info.login_id);
    if(reg_info.login_id == null || reg_info.login_id == ""){
      $scope.showToast("請輸入登入名稱","short","center");
    }else if(/^[0-9]*$/.test(reg_info.login_id)){
      $scope.showToast("登入名稱不能全數字","short","center");
    }else if(/^[a-zA-Z0-9]*$/.test(reg_info.login_id) == false || /^[a-zA-Z0-9]*$/.test(reg_info.login_pw) == false){
      $scope.showToast("登入名稱及密碼只接受英文或數字","short","center");
    }else if(reg_info.login_id.length < 6){
      $scope.showToast("登入名稱過短","short","center");
    }else if(reg_info.login_id.length > 15){
      $scope.showToast("登入名稱過長","short","center");
    }else if(reg_info.login_pw == null){
      $scope.showToast("請輸入登入密碼","short","center");
    }else if(reg_info.login_pw.length < 6){
      $scope.showToast("登入密碼過短","short","center");
    }else if(reg_info.login_pw.length > 15){
      $scope.showToast("登入密碼過長","short","center");
    }else if(reg_info.login_pw != reg_info.login_pw_confirm){
      $scope.showToast("確認密碼錯誤","short","center");
    }else{
      $scope.user = UserService.get();
      reg_info.user_id = $scope.user.user_id;
      reg_info.token = $scope.user.token;
      $scope.submitting = true;
      fetchPostData('user', 'user_update', reg_info, function(result){
        $timeout(function(){
          console.log(result);
          if(result.retcode == 0){
            UserService.save(result.user);
            $scope.getUserInfo(function(){
              $scope.app_title = "已完成登記";
              $scope.show_reg_suc = false;
              $scope.show_reg_complete = true;
            });
          }else if(result.retcode == 1){
            if(result.msg_id == 0){
              $scope.showToast("錯誤輸入！","short","center");
            }else if(result.msg_id == 10){
              $scope.showToast("稱呼己被使用，請轉用其他稱乎！","short","center");
            }else if(result.msg_id == 11){
              $scope.showToast("登入名稱己被使用，請轉用其他名稱！","short","center");
            }else{
              $scope.showToast("系統繁忙中，請稍後再嘗試！","short","center");
            }
          }else{
            $scope.showToast("系統繁忙中，請稍後再嘗試！","short","center");
          }
          $scope.submitting = false;
        }, 1000);
        
      });
    }
  };
  
  $scope.openUpdateInfo = function(){
    $scope.closeLogin();
    $scope.user = UserService.get();
    $state.go("tab.profile", {'user_id':$scope.user.user_id,'sort':'owner'}, {'reload':true});
  };
  
});
