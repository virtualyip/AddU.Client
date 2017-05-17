angular.module('come_rice.main.ctrl', [])

.controller('MainCtrl', function($scope, $rootScope, $state, $rootScope, $cordovaToast, $timeout, $ionicModal, $ionicPopup, UserService,
              $cordovaClipboard, $ionicPopover, $cordovaSocialSharing) {
  
  document.addEventListener("deviceready", function(e){
    if ( (window.cordova || window.PhoneGap || window.phonegap)
      && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent) ) {
        $rootScope.isMobile = true;
    } else {
        $rootScope.isMobile = false;
    } 
    //console.log($rootScope.isMobile);
    $scope.mainInit();
  }, false);
  
  $ionicModal.fromTemplateUrl('instruction.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.instructionModal = modal;
  });

  $scope.openInstructionModal = function(instructionSrc) {
    $scope.instructionSrc = instructionSrc;
    $scope.instructionModal.show();
  };

  $scope.closeInstructionModal = function() {
    $scope.instructionModal.hide();
  };

  $scope.mainInit = function(){
    $scope.redirect = {};
    $rootScope.user = UserService.get();
    $scope.user = UserService.get();
    $timeout(function(){$(".tab-item.home").addClass('selected');}, 200);
    
    $rootScope.APP_VERSION_CURRENT = "1.0.0";
    $rootScope.APP_VERSION_LASTEST = APP_VERSION;
    
    $rootScope.news_cnt = {};
    if($rootScope.APP_VERSION_CURRENT != $rootScope.APP_VERSION_LASTEST){
      $rootScope.news_cnt.profile = 1;
      $('.tab-item.profile').css("position:relative");
      $('.tab-item.profile').append("<span class='news_cnt'>"+$rootScope.news_cnt.profile+"</span>");
    }
  };
  
  $scope.logout = function(){
    $scope.user_info = UserService.get_info();
    $rootScope.user_info = UserService.get_info();
    
    if($scope.user_info.temp_user){
      $ionicPopup.confirm({
        title: '請先設定登入帳號',
        template: '請在登出前先設定登入帳號'
      }).then(function(res) {
        if(res) {
          $scope.showLogin();
        }
      });
    }else{
      $ionicPopup.confirm({
        title: '確定登出',
        template: '確定登出？<br>請記住你的登入密碼下次再登入！'
      }).then(function(res) {
        if(res) {
          UserService.clear();
          $scope.user = null;
          $scope.user_info = null;
          $scope.showToast("己登出", "short", "center");
          $scope.tabChange('home');
          $rootScope.$broadcast('loggedOut');
        }
      });
    }
  };
  
  $scope.showToast = function(message, duration, location) {
    if(!$rootScope.isMobile){
      toastr.info(message, '');
    }else{
      $cordovaToast.show(message, duration, location).then(function(success) {
          //console.log("The toast was shown");
      }, function (error) {
          //console.log("The toast was not shown due to " + error);
      });
    }
  };
  
  $scope.showLogin = function(){
    $ionicModal.fromTemplateUrl('user-login.html', function(modal) {
      $scope.userLoginModal = modal;
    }, {
      scope: $scope
    });
    $timeout(function(){$scope.userLoginModal.show();},200);
    /*
    $rootScope.$broadcast('showLogin');
    $scope.redirect.url = url;
    $scope.redirect.params = params;
    */
  };
    
  $scope.closeLogin = function(){
    $scope.user = UserService.get();
    if($scope.user.user_id != null){
      $scope.showToast("己登入！","short","center");
      $rootScope.$broadcast('loggedIn');
    }else{
      $scope.showToast("登入失敗！","short","center");
    }
    $scope.userLoginModal.remove();
  };
  
  $scope.getUserInfo = function(callback){
    $scope.user = UserService.get();
    fetchPostData('user', 'get_user_info', $scope.user, function(result){
      $timeout(function(){
        console.log(result);
        if(result.retcode == 0){
          result.user_info.img_src = img_url+"?request=get_user_icon&user_id="+$scope.user.user_id;
          UserService.save_info(result.user_info);
          console.log('user info loaded successfully');
        }else if(result.retcode == 1){
          //$scope.showToast("會員資料讀取失敗！","short","center");
        }else if(result.retcode == 2){
          UserService.clear();
        }else{
          $scope.showToast("系統繁忙中，請稍後再嘗試！","short","center");
        }
        if(callback != null) callback();
      });
    });
  };
  
  
  $scope.$on('loggedIn', function() {
    $scope.user = UserService.get();
    if($scope.user.user_id != null && $scope.user.token != null){
      $scope.user.logined = true;
    }else{
      $scope.user.logined = false;
    }
    $scope.$on('$destroy', function() {
      $scope.userLoginModal.remove();
    });
  });
  
  $scope.followTable = function(table, callback){
    
    $scope.user = UserService.get();
    if($scope.user.user_id != null){
      table_follow_params = {};
      table_follow_params['table_id'] = table.table_id;
      table_follow_params['user_id'] = $scope.user.user_id;
      table_follow_params['token'] = $scope.user.token;
      
      console.log(table_follow_params);
      if(!table.isBookmarked){
        fetchPostData('table', 'table_follow', table_follow_params, function(result){
          $timeout(function() {
            console.log(result);
            if(result.retcode == 0){
              table.isBookmarked = true;
              $scope.showToast("已收藏活動", "long", "center");
              if(callback != null) callback();
            }else if(result.retcode == 1 || result.retcode == 2){
              $scope.showToast("請先登入","short","center");
              $scope.showLogin();
            }else{
              $scope.showToast("系統繁忙，請稍後再試","short","center");
            }
          });
        });
      }else{
        fetchPostData('table', 'table_unfollow', table_follow_params, function(result){
          $timeout(function() {
            console.log(result);
            if(result.retcode == 0){
              table.isBookmarked = false;
              $scope.showToast("已取消收藏活動", "long", "center");
              if(callback != null) callback();
            }else if(result.retcode == 1 || result.retcode == 2){
              $scope.showToast("請先登入","short","center");
              $scope.showLogin();
            }else{
              $scope.showToast("系統繁忙，請稍後再試","short","center");
            }
          });
        });
      }
    }else{
      $scope.showLogin();
    }
  };
  
  $scope.openUserNamecard = function(user_id){
    $scope.user = UserService.get();
    if($scope.user.user_id == user_id) {
      $scope.tabChange('profile');
    }else{
      $state.go('tab.profileView',{'user_id':user_id, 'sort':'owner', 'view':true},{'reload':true});      
      $(".tab-item").removeClass('selected');
    }
  };
  
  $scope.toggleUserSetting = function(){
    $state.go('tab.setting');
  };
  
  $scope.tabChange = function(tab, params){
    if(tab == 'home'){
      params == null ? $state.go('tab.home', {'sort':'date'}) : $state.go('tab.home', params, {'reload':true});
    }else if(tab == 'event'){
      $state.go('tab.editEvent', {'table_id':null});
    }else if(tab == 'search'){
      $state.go('tab.search');
    }else if(tab == 'profile'){
      $scope.user = UserService.get();
      $state.go('tab.profile', {'user_id':$scope.user.user_id, 'sort':'owner', 'view':false});
    }else if(tab == 'feedback'){
      $state.go('tab.feedback');
    }
    $(".tab-item").removeClass('selected');
    $(".tab-item."+tab).addClass('selected');
    $rootScope.hideTabs = false;
  };
  
  $scope.copyText = function(value) {
    if($rootScope.isMobile){
      $cordovaClipboard.copy(value).then(function() {
        $scope.showToast("己復制", "short", "center");
      }, function() {
        console.error("There was an error copying");
      });
    }else{
      $ionicPopup.confirm({
        title: '復制',
        template: "<input type='text' value='"+value+"'>"
      });
    }
  };
  
  $ionicPopover.fromTemplateUrl('share-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });
  $scope.openSharePopover = function($event, event) {
    $scope.popover.show($event);
    $scope.event = event;
  };
  $scope.closeSharePopover = function() {
    $scope.popover.hide();
  };
  
  $scope.copyShareUrl = function(event) {
    share_url = share_path + event.table_id;
    if($rootScope.isMobile){
      $cordovaClipboard.copy(share_url).then(function() {
        $scope.showToast("己復制分享連結", "short", "center");
      }, function() {
        console.error("There was an error copying");
      });
    }else{
      $ionicPopup.confirm({
        title: '請復制以下分享連結',
        template: "<input type='text' value='"+share_url+"'>"
      });
    }
  };
  
  $scope.shareAnywhere = function (event) {
    console.log(event);
    share_url = share_path + event.table_id;
    share_text = "唏！搵人嚟"+event.table_title+"！入嚟一齊傾！";
    if(!$rootScope.isMobile){
      $scope.showToast("只限手機Apps使用", "short", "center");
    }else{
      $cordovaSocialSharing.share(event.table_title, share_text, null, share_url);
    }
  };
  
  $scope.shareWhatsApp = function(event) {
    share_url = share_path + event.table_id;
    share_text = "唏！搵人嚟"+event.table_title+"！入嚟一齊傾！";
    if(!$rootScope.isMobile){
      $scope.showToast("只限手機Apps使用", "short", "center");
    }else{
      $cordovaSocialSharing.shareViaWhatsApp(share_text, null, share_url)
      .then(function(result) {
        // Success!
        console.log(result);
      }, function(err) {
        // An error occured. Show a message to the user
        $scope.showToast("未能透過WhatsApp傳送，可能你沒安裝該程式，請嘗試其他方法","short","center");
      });
    }
  };
  
  $scope.shareFacebook = function(event) {
    share_url = escape(share_path + event.table_id);
    share_text = "唏！搵人嚟"+event.table_title+"！入嚟一齊傾！";
    if(!$rootScope.isMobile){
      window.open("http://www.facebook.com/sharer/sharer.php?u="+share_url, 'sharer', "height=300px, width=400px");
    }else{
      $cordovaSocialSharing.shareViaFacebook(share_text, null, share_url)
      .then(function(result) {
        // Success!
        console.log(result);
      }, function(err) {
        // An error occured. Show a message to the user
        console.log(err);
        $scope.showToast("未能透過Facebook傳送，可能你沒安裝該程式，請嘗試其他方法","short","center");
      });
    }
  };
  
  $scope.shareTwitter = function(event) {
    share_url = escape(share_path + event.table_id);
    share_text = "唏！搵人嚟"+event.table_title+"！入嚟一齊傾！";
    if(!$rootScope.isMobile){
      window.open("http://www.twitter.com/intent/tweet?source=webclient&text="+share_text+share_url, 'sharer', "height=300px, width=400px");
    }else{
      $cordovaSocialSharing.shareViaTwitter(share_text, null, share_url)
      .then(function(result) {
        // Success!
        console.log(result);
      }, function(err) {
        // An error occured. Show a message to the user
        console.log(err);
        $scope.showToast("未能透過Twitter傳送，可能你沒安裝該程式，請嘗試其他方法","short","center");
      });
    }
  };
  
  $scope.fetchEventInfo = function(event){ 
    
    var user_img_src = img_url+"?request=get_user_icon&user_id="+event.user_id;            
    event.user_img_src = user_img_src;
    
    //***************/
    // Date Value / Text
    //***************/
   
    var d = new Date(event.table_date);
    var t = new Date(event.table_date + ' '+ event.table_time);
    var duration = 1000*60*60*event.table_time_lastfor;
    event.table_date_text = (d.getMonth()+1) + "月" + d.getDate() + "日";
    event.table_time_text = " " + t.getHours()+":"+("0"+t.getMinutes()).slice(-2);

    //***************/
    // Event Proporties Value
    //***************/
   
    event.isEnterable = true;
    event.isTableOwner = false;
    event.isProcessing = false;
    event.isEnded = false;
    event.hasDeadline = false;
    event.isDeadlined = false;
    event.user_filter_on = false;
    event.isBookmarked = false;
    event.isValidUser = false;
    event.isWhitelist = false;
    event.isBlacklisted = false;
    event.isDrinkable = event.table_drink;
    event.isPrivate = event.private;
    event.isAddressPublic = event.address_public;
    
    $scope.user = UserService.get();
    if(event.user_id == $scope.user.user_id){
      event.isTableOwner = true;
    }
    
    if(event.involve_replied_status == "accept" && event.involve_withdrawn_date == null){
      event.isTableMember = true;
    }
    
    if(t.getTime() < (new Date()).getTime()){
      event.isEnded = true;
    }else if(t.getTime() < (new Date()).getTime() && (new Date()).getTime() < t.getTime()+duration){
      event.isProcessing = true;
    }
    
    if(event.table_apply_deadline != null){
      event.hasDeadline = true;
      var d = new Date(event.table_apply_deadline);
      if(d.getTime() < (new Date()).getTime()){
        event.isDeadlined = true;
      }
    }
    
    if(event.age_include != null || event.sex_include != null || event.native_include != null
        || event.dislike_exclude > 0 || event.likes_include > 0 
        || event.points_include > 0 || event.user_lv_include > 0){
      event.user_filter_on = true;
    }
    
    if(event.follow_date != null && event.unfollow_date == null){
      event.isBookmarked = true;
    }
    
    if(event.user_id_required == 0){
      event.isValidUser = true;
    }else if($scope.user.user_id != null){
      event.isValidUser = true;
    }
    
    if(event.user_id_include != null){
      user_list = event.user_id_include.split(',');
      event.isWhitelist = true;
    }
    
    if(event.user_id_exclude != null){
      user_list = event.user_id_exclude.split(',');
      event.isBlacklisted = true;
    }
    
    if(event.isBlacklisted){
      event.isEnterable = false;
    }
    
    //***************/
    // Target Text
    //***************/
   
    event.target_include_text = "";
    
    if(event.native_include == 'hk'){
      event.target_include_text += "港人";
    }else if(event.native_include == 'cn'){
      event.target_include_text += "國內";
    }else if(event.native_include == 'asia'){
      event.target_include_text += "亞州";
    }else if(event.native_include == 'ot'){
      event.target_include_text += "外藉";
    }
    
    if(event.age_include == 'teenager'){
      event.target_include_text += "青年";
    }else if(event.age_include == 'middleage'){
      event.target_include_text += "中年";
    }else if(event.age_include == 'elderly'){
      event.target_include_text += "年長";
    }
    
    if(event.sex_include == 'm'){
      event.target_include_text += "男士";
    }else if(event.sex_include == 'f'){
      event.target_include_text += "女士";
    }
    
    event.target_include_text == "" ? event.target_include_text = "對象不限" : event.target_include_text = "限"+event.target_include_text;
        
    //***************/
    // Address Text
    //***************/
    event.table_region = get_area_text(event.table_region);
    event.table_district = get_area_text(event.table_district);
    
    if(event.table_address == '******'){
      event.table_address = "只限參加者查看活動位置" ;
    }
    
    //***************/
    // General Value / Text
    //***************/
   
    if(event.table_type == ""){
      event.table_type_text = "一般活動";
    }else{
      event.table_type_text = "一般活動";
    }
    
    event.chat_cnt = event.chat_cnt || 0;
    event.chat_cnt >= 1000 ? event.chat_cnt = "999+" : '';
    event.chat_cnt_text = event.chat_cnt +"人在留言";
    if(event.chat_cnt == 0){
      event.chat_cnt_text = "進入留言";
    }
    
    event.followers = event.followers || 0;
    event.followers >= 1000 ? event.followers = "999+" : '';
    event.followers_text = event.followers +"人感興趣";
    if(event.followers == 0){
      if(event.isTableOwner){
        event.followers_text = "按此修改";
      }else{
        event.followers_text = "按此關注";
      }
    }
    
    event.invite_cnt_text = "組" + (event.leader_cnt + event.invite_cnt) + "人"; 
    event.total_involve_cnt = parseInt(event.total_involve_cnt) || 0;   
    if(event.invite_cnt - event.total_involve_cnt <= 0){
      event.invite_cnt_text += "(己滿)";
    }else{
      event.invite_cnt_text += "(欠" + (event.invite_cnt - event.total_involve_cnt) + "人)";
    }
    
    event.cfg = UserService.get_cfg(event.table_id,{});
    event.last_apply == null ? event.cfg.last_apply = 0 : "";
    event.last_chat_private == null ? event.cfg.last_chat_private = 0 : "";
    event.last_chat_public == null ? event.cfg.last_chat_public = 0 : "";
    event.last_follow == null ? event.cfg.last_follow = 0 : "";
    UserService.save_cfg(event.table_id, event.cfg);
    
    //news count update
    event.hasNewFollow = false;
    event.hasNewApply = false;
    event.hasNewChatPublic = false;
    event.hasNewPrivateChat = false;
    //UserService.clear_cfg();
    event.cfg = UserService.get_cfg(event.table_id, {});
    //console.log(event.cfg );
    if((event.cfg.last_follow == null && event.last_follow > 0) || event.cfg.last_follow < event.last_follow){
      event.hasNewFollow = true;
    }
    if((event.cfg.last_apply == null && event.last_apply > 0) || event.cfg.last_apply < event.last_apply){
      event.hasNewApply = true;
    }
    if((event.cfg.last_chat_public == null && event.last_chat_public > 0) || event.cfg.last_chat_public < event.last_chat_public){
      event.hasNewChatPublic = true;
    }
    if((event.cfg.last_chat_private == null && event.last_chat_private > 0) || event.cfg.last_chat_private < event.last_chat_private){
      event.hasNewPrivateChat = true;
    }
    
    //***************/
    // Event Status Text
    //***************/
    event.table_status_text = "";
    if(event.private == 1){
      event.table_status_text += ",非公開";
    }
    if(event.table_cancelled_date != null){
      event.table_status_text += ",已取消";
    }
    if(event.isEnded){
      event.table_status_text += ",已完結";
    }
    if(event.isTableOwner){
      event.table_status_text += ",您主辦";
    }
    if(event.isProcessing){
      event.table_status_text += ",進行中";
    }
    if(!event.isEnterable){
      event.table_status_text += ",不能參與";
    }
    if(event.involve_withdrawn_date != null){
      event.table_status_text += ",已退出";
    }
    if(event.involve_type == 'apply' && event.involve_replied_status == null && event.involve_withdrawn_date == null){
      event.table_status_text += ",要求加入";
    }
    if(event.involve_type == 'apply' && event.involve_replied_status == 'accept' && event.involve_withdrawn_date == null){
      event.table_status_text += ",已加入";
    }
    if(event.involve_type == 'apply' && event.involve_replied_status == 'reject' && event.involve_withdrawn_date == null){
      event.table_status_text += ",已拒絕";
    }
    if(event.involve_type == 'apply' && event.involve_replied_status == 'consider' && event.involve_withdrawn_date == null){
      event.table_status_text += ",考慮中";
    }
    if(event.involve_type == 'invite' && event.involve_replied_status == null && event.involve_withdrawn_date != null){
      event.table_status_text += ",被邀請";
    }
    if(event.involve_type == 'invite' && event.involve_replied_status == 'accept' && event.involve_withdrawn_date != null){
      event.table_status_text += ",已加入";
    }
    if(event.involve_type == 'invite' && event.involve_replied_status == 'reject' && event.involve_withdrawn_date == null){
      event.table_status_text += ",已拒絕";
    }
    if(event.involve_type == 'invite' && event.involve_replied_status == 'consider' && event.involve_withdrawn_date == null){
      event.table_status_text += ",考慮中";
    }
    if(event.unfollow_date != null){
      event.table_status_text += ",取消關注";
    }
    if(event.isDeadlined){
      event.table_status_text += ",已截止";
    }
    if(event.invite_cnt - event.total_involve_cnt <= 0){
      event.table_status_text += ",齊人";
    }
    if(event.user_filter_on){
      event.table_status_text += ",設有提示";
    }
    if(event.table_status_text == ""){
      event.table_status_text += ",招人中";
    }
    event.table_status_text = event.table_status_text.substr(1);
  };

  $scope.fetchEventImage = function(event){
    var img_src = img_url+"?request=get_table_icon&table_id="+event.table_id;            
    event.img_src = img_src;
    /*
    event.event_img = $("<img />").attr('src', event.img_src)
    .load(function() { $(".t_"+event.table_id).html(event.event_img); })
    .error(function(){ $(".t_"+event.table_id).html("<img src='img/bg-door.jpg'/>"); });
    */
    /*
    event.user_img = $("<img />").attr('src', user_img_src)
    .load(function() { $(".u_"+event.user_id).html(event.user_img); })
    .error(function(){ $(".u_"+event.user_id).html("<img src='img/user-default.jpg'/>"); });
    */
    
  };
  
  $scope.fetchTableUser = function(table_user){
     var img_src = img_url+"?request=get_user_icon&user_id="+table_user.user_id;            
     table_user.img_src = img_src;
     if(table_user.member_cnt != null){
       table_user.member_cnt_text = "("+table_user.member_cnt+"人)";
     }
     if(table_user.role == 'leader'){
       table_user.role = "leader";
       table_user.role_lv = 0;
       table_user.role_text = "主";
       table_user.role_desc = "舉辦者";
     }else if(table_user.role == 'invitor' && table_user.status == 'accept'){
       table_user.role = "vip";
       table_user.role_lv = 1;
       table_user.role_text = "VIP";
       table_user.role_desc = "己受邀";
     }else if(table_user.role == 'invitor' && table_user.status == 'reject'){
       table_user.role = "vip";
       table_user.role_lv = 6;
       table_user.role_text = "棄";
       table_user.role_desc = "不參加";
     }else if(table_user.role == 'invitor' && table_user.status == 'consider'){
       table_user.role = "vip";
       table_user.role_lv = 5;
       table_user.role_text = "考";
       table_user.role_desc = "考慮中";
     }else if(table_user.role == 'applier' && table_user.status == 'accept'){
       table_user.role = "customer";
       table_user.role_lv = 2;
       table_user.role_text = "客";
       table_user.role_desc = "己加入";
     }else if(table_user.role == 'applier' && table_user.status == 'reject'){
       table_user.role = "customer";
       table_user.role_lv = 7;
       table_user.role_text = "拒";
       table_user.role_desc = "已拒絕";
     }else if(table_user.role == 'applier' && table_user.status == 'consider'){
       table_user.role = "customer";
       table_user.role_lv = 5;
       table_user.role_text = "考";
       table_user.role_desc = "考慮中";
     }else if(table_user.role == 'invitor'){
       table_user.role_lv = 3;
       table_user.role_text = "邀";
       table_user.role_desc = "被邀請";
     }else if(table_user.role == 'applier'){
       table_user.role_lv = 4;
       table_user.role_text = "申";
       table_user.role_desc = "申請中";
     }else if(table_user.role == 'follower'){
       table_user.role_lv = 8;
       table_user.role_text = "關";
       table_user.role_desc = "感興趣";
       table_user.member_cnt_text = "";
     }else if(table_user.role == 'withdrawn' && table_user.status == null){
       table_user.role = "doubt";
       table_user.role_lv = 97;
       table_user.role_text = "疑";
       table_user.role_desc = "考慮中";
       table_user.member_cnt_text = "";
     }else if(table_user.role == 'withdrawn'){
       table_user.role_text = "退";
       table_user.role_lv = 98;
       table_user.role_desc = "己退出";
       table_user.member_cnt_text = "";
     }else{
       table_user.role_text = "";
       table_user.role_lv = 99;
       table_user.role_desc = "感興趣";
       table_user.member_cnt_text = "";
     }
  };

  $scope.dateToText = function(date_str){
    //yyyy-mm-dd hh:mm:ss
    var curr_dt = new Date();
    var targ_dt = new Date(date_str);
    
    //in second unit
    var diff = Math.floor(Math.abs(curr_dt.getTime() - targ_dt.getTime())/1000);
    var profix = (curr_dt.getTime() > targ_dt.getTime()) ? "前" : "後";
    if(diff >= 0 && diff < 60){
      result = "剛剛";
    }else if(diff >= 60 && diff < 60*60){
      result = Math.floor(diff/60)+"分鐘"+profix;
    }else if(diff >= 60*60 && diff < 60*60*24){
      result = Math.floor(diff/60/60)+"小時"+profix;
    }else if(diff >= 60*60*24 && diff < 60*60*24*7){
      result = Math.floor(diff/60/60/24)+"日"+Math.floor(diff/60/60%24)+"小時"+profix;
    }else if(diff >= 60*60*24*7 && diff < 60*60*24*7*5){
      result = Math.floor(diff/60/60/24/7)+"星期"+profix;
    }else{
      var diff_m = curr_dt.getMonth() - targ_dt.getMonth() + (12 * (curr_dt.getFullYear() - targ_dt.getFullYear())) - (curr_dt.getDate() > targ_dt.getDate())*1 - 1;
      result = Math.floor(Math.abs(diff_m))+"個月"+profix;
    }
    
    return result;
  };
  
  $scope.dateToWeekText = function(date_str, prefix){
    var targ_dt = new Date(date_str);
    switch(targ_dt.getDay()){
      case 0: return prefix+"日";
      case 1: return prefix+"一";
      case 2: return prefix+"二";
      case 3: return prefix+"三";
      case 4: return prefix+"四";
      case 5: return prefix+"五";
      case 6: return prefix+"六";
      default: return "?";
    }
  };

});

function get_area_text(key){
  $result = '其他';
  $.each(area_mapping, function(area_key, area_value){
    $.each(area_value, function(region_key, region_value){
      if(region_key == key){
        $result = region_value.text;
        return $result;
      }
      $.each(region_value.district, function(district_key, district_value){
        if(district_key == key){
          $result = district_value.text;
          return $result;
        }
      });
    });
  });
  return $result;
}

function stringBytes(c){
  var n=c.length,s;
  var len=0;
  for(var i=0; i <n;i++){
   s=c.charCodeAt(i);
   while( s > 0 ){
      len++;
      s = s >> 8;
   }
  }
  return len;
}
