angular.module('come_rice.eventUser.ctrl', [])

.controller('EventUserCtrl', function($scope, $state, $ionicModal, UserService, 
      $timeout, $stateParams) {
  /*
  $scope.involveUpdate = function(i, type){
    involve_reply_user = $scope.table_details.user_list[i];
    involve_reply_params = {};
    involve_reply_params['involve_receiver_id'] = $scope.user.user_id;
    involve_reply_params['token'] = $scope.user.token;
    involve_reply_params['involve_id'] = involve_reply_user.involve_id;
    involve_reply_params['involve_replied_status'] = type;
    console.log(involve_reply_params);
    
    fetchPostData('table', 'table_involve_reply', involve_reply_params, function(result){
      console.log(result);
      $timeout(function() {
        
        if(result.retcode == 0){
        }else{
          
        }
      }, 500);
    });
  };
  */
 
  $scope.involveReply = function(involved_user, type){
    $scope.user = UserService.get();
    involve_reply_user =involved_user;
    involve_reply_params = {};
    involve_reply_params['involve_receiver_id'] = $scope.user.user_id;
    involve_reply_params['token'] = $scope.user.token;
    involve_reply_params['involve_id'] = involved_user.involve_id;
    involve_reply_params['involve_replied_status'] = type;
    console.log(involve_reply_params);
    
    fetchPostData('table', 'table_involve_reply', involve_reply_params, function(result){
      console.log(result);
      $timeout(function() {
        
        if(result.retcode == 0){
          $scope.showToast("己更新","short","center");
          $scope.tableDetailsInit();
        }else{
          $scope.showToast("系統繁忙","short","center");
        }
      });
    });
  };
});
      