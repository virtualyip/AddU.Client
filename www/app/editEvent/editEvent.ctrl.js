angular.module('come_rice.editEvent.ctrl', [])

.controller('EditEventCtrl', function($scope, $rootScope, $state, $stateParams, $ionicPopup, 
      $ionicSideMenuDelegate, $cordovaCamera, $cordovaFile, $timeout, UserService, $jrCrop) {
  
  $scope.takePic = function() {
    if(!$rootScope.isMobile){
      $scope.showToast("只限手機Apps使用","short","center");
      return;
    }
    var options =   {
        quality: 50,
        allowEdit : false,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: 0,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
        encodingType: 0,     // 0=JPG 1=PNG
        correctOrientation: true
    };
    // Take picture using device camera and retrieve image as base64-encoded string
    $cordovaCamera.getPicture(options).then(function(imageData) {
      $scope.showToast("成功選取","short","center");
      $jrCrop.crop({
          url: "data:image/jpeg;base64," +imageData,
          width: 400,
          height: 300,
          title: '請選擇範圍'
      }).then(function(canvas) {
          // success!
          var image = canvas.toDataURL();
          $scope.event.table_icon = image;
          $scope.temp.img_src = image;
          $scope.event.table_icon_upt = 1;
          $timeout(function() {$scope.$apply();});
      }, function() {
          // User canceled or couldn't load image.
          $scope.showToast("請重新再試","short","center");
      });
    }, function(err) {
      $scope.showToast("請重新再試","short","center");
    });
  };
  
  $scope.delTableIcon = function(){
    $ionicPopup.confirm({
      title: '確定移除圖片？',
      template: '確定移除圖片？'
    }).then(function(res) {
      if(res) {
        $scope.event.table_icon = null;
        $scope.temp.img_src = null;
        $scope.event.table_icon_upt = 1;
      }
    });
  };
  
  $scope.$on('loggedIn', function() {
    $scope.user = UserService.get();
    $scope.user_info = UserService.get_info();
    if($scope.user.user_id != null && $scope.user.token != null){
      $scope.editEventInit();
    }
  });
  
  $scope.$on('loggedOut', function() {
    $scope.editEventInit();
  });
  
  $scope.editEventInit = function(){
    //app instruction
    instruction = UserService.get_cfg("instruction", {});
    if(instruction.event_edit == null || instruction.event_edit == false){
      $scope.openInstructionModal("instruction/event-edit.png");
      instruction.event_edit = true;
      instruction = UserService.save_cfg("instruction", instruction);
    }
    
    $scope.user = UserService.get();
    $scope.user_info = UserService.get_info();
    if($scope.user == '' || $scope.user == null){
      $scope.user.logined = false;
      //$scope.showLogin();
    }else{
      $scope.user.logined = true;
    }
    $scope.temp = {};
    $scope.event = {};
    
    if($stateParams.table_id != null && $stateParams.table_id != 0){
      $scope.temp['showElement'] = {'table_district':true, 'table_address':true, 'address_public':true,
                                    'table_calendar':false, 'table_time':true, 'table_time_lastfor':true,
                                    'table_apply_deadline_days':true, 'table_apply_deadline_date':false, 
                                    'table_deadline_calendar':false, 'table_apply_deadline_time':false,
                                    'table_target_setting':true};
                                    
      //get data
      get_table_info_params = {};
      get_table_info_params['table_id'] = $stateParams.table_id;
      get_table_info_params['user_id'] = $scope.user.user_id;
      get_table_info_params['token'] = $scope.user.token;
      console.log(get_table_info_params);
      fetchPostData('table', 'get_table_info', get_table_info_params, function(result){
        console.log(result);
        $timeout(function() {
          if(result.retcode == 0){
             $scope.event = result.table_info;
             $scope.temp.img_src = img_url+"?request=get_table_icon&table_id="+$scope.event.table_id;
             $scope.temp.age_include = $scope.event.age_include || "";
             $scope.event.sex_include = $scope.event.sex_include || "";
             $scope.event.native_include = $scope.event.native_include || "";
             $scope.temp.region_text = get_area_text($scope.event.table_region);
             $scope.temp.district_text = get_area_text($scope.event.table_district);
             $scope.temp.table_date = $scope.event.table_date;
             //$scope.temp.table_time = new Date($scope.event.table_date+' '+$scope.event.table_time);
             $scope.temp.table_time_hr = new Date($scope.event.table_date+' '+$scope.event.table_time).getHours();
             $scope.temp.table_time_min = new Date($scope.event.table_date+' '+$scope.event.table_time).getMinutes();
             
             $scope.temp.table_apply_deadline_date = new Date($scope.event.table_apply_deadline);
             $scope.temp.table_apply_deadline_time = new Date($scope.event.table_apply_deadline);
             if($scope.event.table_apply_deadline_date > 0){
               $scope.temp['showElement'].table_apply_deadline_date = true;
               $scope.temp['showElement'].table_apply_deadline_time = true;
             }
             $scope.temp.table_apply_deadline_days = $scope.event.table_apply_deadline_days;
          }else if(result.retcode == 1 || result.retcode == 2){
            $scope.showToast("請先登入","short","center");
            $scope.showLogin();
          }else{
            $scope.showToast("系統繁忙，請稍後再試","short","center");
          }
        });
      });
    }else{
      //init params
      var d = new Date();
      $scope.temp.table_minDate = d.getFullYear() + "-" + ('0'+(+d.getMonth()+1)).slice(-2) + "-" + ('0'+d.getDate()).slice(-2);
      $scope.temp.table_maxDate = d.getFullYear() + "-" + ('0'+(+d.getMonth()+7)).slice(-2) + "-" + ('0'+d.getDate()).slice(-2);     
      $scope.temp.table_date = $scope.temp.table_minDate;
      
      //$scope.temp.table_time = new Date("1970-01-01 "+("0"+Math.max(d.getHours()+1, 18)).slice(-2)+":00:00");
      $scope.temp.table_time_hr = "23";
      $scope.temp.table_time_min = "59";
      $scope.event.table_region = "zot";
      $scope.event.table_district = "zot";
      $scope.event.table_address = " ";
      $scope.temp.region_text = get_area_text($scope.event.table_region);
      $scope.temp.district_text = get_area_text($scope.event.table_district);
             
      $scope.event.table_content = "一般活動";
      $scope.event.private = 0;
      $scope.event.address_public = 1;
      $scope.event.leader_cnt = 1;
      $scope.event.invite_cnt = 1;
      $scope.event.table_time_lastfor = 1;
      $scope.event.table_drink = 0;
      $scope.event.user_id_required = 0;
      $scope.event.user_lv_include = 0;
      $scope.event.points_include = 0;
      $scope.event.likes_include = 0;
      $scope.event.dislike_exclude = 0;
      $scope.temp.table_apply_deadline_days = 0;
      $scope.temp.table_apply_deadline_date = new Date("2100-01-01 12:00:00");
      $scope.temp.table_apply_deadline_time = new Date("2100-01-01 23:59:59");
      $scope.temp['showElement'] = {'table_district':false, 'table_address':false, 'address_public':false,
                                    'table_calendar':false, 'table_time':false, 'table_time_lastfor':false,
                                    'table_apply_deadline_days':false, 'table_apply_deadline_date':false, 
                                    'table_deadline_calendar':false, 'table_apply_deadline_time':false,
                                    'table_target_setting':false};
    }
  };
  $scope.editEventInit();
  
  $scope.tableDateClicked = function(){
    $scope.temp['showElement'].table_calendar = true;
  };
  
  $scope.tableCalendarChanged = function(){
    if($scope.temp.table_date != null){
      $scope.temp['showElement'].table_calendar = false;
    }
  };
  
  $scope.tableTimeChanged = function(){
    var d = new Date($scope.temp.table_date);
    if($scope.temp.table_apply_deadline_date == null)
      $scope.temp.table_apply_deadline_date = d.getFullYear() + "-" + ('0'+(+d.getMonth()+1)).slice(-2) + "-" + ('0'+d.getDate()).slice(-2);      
    $scope.temp.table_deadline_maxDate = d.getFullYear() + "-" + ('0'+(+d.getMonth()+1)).slice(-2) + "-" + ('0'+d.getDate()).slice(-2);      
  };
  
  $scope.tableApplyDeadlineChanged = function(value){
    if(value == -1){
      $scope.temp.table_apply_deadline_date = $scope.temp.table_date;
    }
  };
  
  $scope.tableApplyDeadlineDateClicked = function(){
    $scope.temp['showElement'].table_deadline_calendar = true;
  };
  
  $scope.tableDeadlineCalendarChanged = function(){
    $scope.temp['showElement'].table_deadline_calendar = false;
  };
  
  $scope.eventSubmit = function(event){
    $scope.user = UserService.get();
    event.user_id = $scope.user.user_id;
    event.token = $scope.user.token;
    event.age_include = JSON.stringify($scope.temp.age_include);
    
    var d, t;
    d = new Date($scope.temp.table_date);
    //t = new Date($scope.temp.table_time);
    t = new Date($scope.temp.table_date+" "+$scope.temp.table_time_hr+":"+$scope.temp.table_time_min+":00");
    
    event.table_date = d.getFullYear() + "-" + ('0'+(+d.getMonth()+1)).slice(-2) + "-" + ('0'+d.getDate()).slice(-2);
    event.table_time = ('0'+t.getHours()).slice(-2) + ":" + ('0'+t.getMinutes()).slice(-2) + ":" + ('0'+t.getSeconds()).slice(-2);
    
    if($scope.temp.table_apply_deadline_days == -1){
      dd = new Date($scope.temp.table_apply_deadline_date);
      dt = new Date($scope.temp.table_apply_deadline_time);
      event.table_apply_deadline = dd.getFullYear() + "-" + ('0'+(+dd.getMonth()+1)).slice(-2) + "-" + ('0'+dd.getDate()).slice(-2) 
              + " " + ('0'+dt.getHours()).slice(-2) + ":" + ('0'+dt.getMinutes()).slice(-2) + ":" + ('0'+dt.getSeconds()).slice(-2);
    }else{      
      event.table_apply_deadline_days = $scope.temp.table_apply_deadline_days;
    }
    console.log(event);
    //validation
    var form_valid = false;
    if(t.getTime() <= new Date().getTime()){
      $scope.showToast('活動時間已過',"short","center");
    }else if(event.table_title == null){
      $scope.showToast('請輸入[主題]',"short","center");
    }else if(stringBytes(event.table_title) > 40){
      $scope.showToast('[主題]過長，最多可40字節',"short","center");
    }else if(event.table_content == null){
      $scope.showToast('請輸入[內容]',"short","center");
    }else if(stringBytes(event.table_content) > 255){
      $scope.showToast('[內容]過長，最多可255字節',"short","center");
    }else if(event.table_region == null){
      $scope.showToast('請選擇[地區]',"short","center");
    }else if(event.table_district == null){
      $scope.showToast('請選擇[分區]',"short","center");
    }else if(event.table_address == null){
      $scope.showToast('請輸入[位置]',"short","center");
    }else if(event.table_date == null){
      $scope.showToast('請選擇[日期]',"short","center");
    }else if(event.table_time == null){
      $scope.showToast('請選擇[時間]',"short","center");
    }else if(stringBytes(event.table_address) > 255){
      $scope.showToast('[位置]過長，最多可255字節',"short","center");
    }else if(event.table_content2 != null && stringBytes(event.table_content2) > 255){
      $scope.showToast('[活動提示]過長，最多可255字節',"short","center");
    }else{
      form_valid = true;
    }
    if(form_valid){
      console.log(event);
      //Submit data
      if($stateParams.table_id != null && $stateParams.table_id != 0){
        $scope.showToast("傳送中","short","center");
        $scope.isSubmitting = true;
        fetchPostData('table', 'table_update', event, function(result){
          $timeout(function() {
            console.log(result);
            if(result.retcode == 0){
              $state.go("tab.event", {'table_id':$stateParams.table_id});
            }else if(result.retcode == 1){
              if(result.msg_id == 1){
                $scope.showToast("沒有需要更新的項目","short","center");
              }else{
                $scope.showToast("輸入錯誤","short","center");
              }
            }else if(result.retcode == 2){
              $scope.showToast("請先登入","short","center");
              $scope.showLogin();
            }else{
                $scope.showToast("系統繁忙，請稍後再試","short","center");
            }
            $scope.isSubmitting = false;
          }, 500);
        });
      }else{
        $scope.isSubmitting = true;
        fetchPostData('table', 'table_create', event, function(result){
          $timeout(function() {
            console.log(result);
            if(result.retcode == 0){
              $state.go("tab.event", {'table_id':result.table_id});
            }else if(result.retcode == 1){
              if(result.msg_id == 2){
                $scope.showToast("最多只能發起"+$scope.user_info.max_lead_no+"個活動, 請等待現有活動完結後再嘗試","short","center");
              }else{
                $scope.showToast("輸入錯誤","short","center");
              }
            }else if(result.retcode == 2){
              $scope.showToast("請先登入","short","center");
              $scope.showLogin();
            }else{
              $scope.showToast("系統繁忙，請稍後再試","short","center");
            }
            $scope.isSubmitting = false;
          }, 500);
        });
      }
    }
    $scope.isSubmitting = false;
  };

  $scope.tableCancellation = function(event){
    $ionicPopup.confirm({
      title: '確定結束此活動？',
      template: '活動參與者可能會因你結束此活動而帶來影響，確定結束此活動？'
    }).then(function(res) {
      if(res) {
        //cancel request.
        $scope.user = UserService.get();
        cancel_table_params = {};
        cancel_table_params['user_id'] = $scope.user.user_id;
        cancel_table_params['token'] = $scope.user.token;
        cancel_table_params['table_id'] = event.table_id;
        
        $scope.isSubmitting = true;
        fetchPostData('table', 'table_cancel', cancel_table_params, function(result){
          $timeout(function() {
            console.log(result);
            if(result.retcode == 0){
              $scope.showToast("已取消","short","center");
              $state.go("tab.home");
            }else if(result.retcode == 1 || result.retcode == 2){
              $scope.showToast("請先登入","short","center");
              $scope.showLogin();
            }else{
              $scope.showToast("系統繁忙，請稍後再試","short","center");
            }
            $scope.isSubmitting = false;
          });
        });
      }
    });
  };
  
  $scope.toggleTimeSelected = function(){
    $scope.hour_select = {"08":"早上8點","09":"早上9點","10":"早上10點","11":"早上11點","12":"中午12點",
                          "13":"下午13點","14":"下午14點","15":"下午15點","16":"下午16點","17":"下午17點",
                          "18":"下午18點","19":"下午19點","20":"下午20點","21":"下午21點","22":"下午22點",
                          "23":"下午23點","00":"零晨0點","01":"零晨1點","02":"零晨2點","03":"零晨3點",
                          "04":"零晨4點","05":"早上5點","06":"早上6點","07":"早上7點"};
    $scope.minute_select = {};
    $scope.region_select = {};
    $scope.district_select = {};
  };
  $scope.hourSelected = function(key, value){
    //$ionicSideMenuDelegate.$getByHandle('area-side-menu').toggleRight(true);
    $scope.hour_select = {};
    $scope.minute_select = {"00":"00分","05":"05分","10":"10分","15":"15分","20":"20分","25":"25分",
                            "30":"30分","35":"35分","40":"40分","55":"55分"};
    $scope.temp.table_time_hr = key;
  };
  $scope.minuteSelected = function(key, value){
    $scope.hour_select = {};
    $scope.temp.table_time_min = key;
    //$ionicSideMenuDelegate.$getByHandle('area-side-menu').toggleRight(false);
  };
  
  
  $scope.toggleRegionSelection = function(){
    //$ionicSideMenuDelegate.$getByHandle('area-side-menu').toggleRight(true);
    $scope.region_select = {};
    $scope.district_select = {};
    $scope.hour_select = {};
    $scope.minute_select = {};
    $.each(area_mapping, function(area_key, area_value){
      $.each(area_value, function(region_key, region_value){
        $scope.region_select[region_key] = region_value.text;
      });
    });
  };
  
  $scope.toggleDistrictSelection = function(key, value){
    //$ionicSideMenuDelegate.$getByHandle('area-side-menu').toggleRight(true);
    $scope.event.table_region = key;
    $scope.temp.region_text = value;
    $scope.event.table_district = null;
    $scope.temp.district_text = "";

    $scope.region_select = {};
    $scope.district_select = {};
    $.each(area_mapping, function(area_key, area_value){
      $.each(area_value, function(region_key, region_value){
        if(region_key == key){
          $.each(region_value.district, function(district_key, district_value){
            $scope.district_select[district_key] = district_value.text;
          });
        }
      });
    });
  };
  
  $scope.districtSelected = function(key, value){
    $scope.event.table_district = key;
    $scope.temp.district_text = value;
    //$ionicSideMenuDelegate.$getByHandle('area-side-menu').toggleRight(false);
  };
  
})
;
