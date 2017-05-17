angular.module('come_rice.search.ctrl', [])

.controller('SearchCtrl', function($scope, $state, $stateParams, $ionicSideMenuDelegate, $timeout, UserService) {

  $scope.searchInit = function(){
    $scope.temp = {};
    $scope.search = {};
    $scope.search.sort = "new";
    
    $scope.temp.showSearchInput = true;
    $scope.temp.show_calendar_from = false;
    $scope.temp.show_calendar_to = false;

    var curr_dt = new Date();
    $scope.search.date_from = (curr_dt.getFullYear())+"-"+("0"+(curr_dt.getMonth()+1)).slice(-2)+"-"+("0"+curr_dt.getDate()).slice(-2);
    $scope.search.date_to = (curr_dt.getFullYear())+"-"+("0"+(curr_dt.getMonth()+4)).slice(-2)+"-"+("0"+curr_dt.getDate()).slice(-2);
    $scope.temp.search_defaultDate = (curr_dt.getFullYear())+"-"+("0"+(curr_dt.getMonth()+1)).slice(-2)+"-"+("0"+curr_dt.getDate()).slice(-2);
    $scope.temp.search_maxDate = (curr_dt.getFullYear())+"-"+("0"+(curr_dt.getMonth()+13)).slice(-2)+"-"+("0"+curr_dt.getDate()).slice(-2);
  
  };
  $scope.searchInit();
  
  $scope.showCalendarFrom = function(){
    $scope.temp.show_calendar_from = true;
  };
  
  $scope.showCalendarTo = function(){
    $scope.temp.show_calendar_to = true;
  };
  
  $scope.searchCalendarChanged = function(){
    $scope.temp.show_calendar_from = false;
    $scope.temp.show_calendar_to = false;
  };
  
  $scope.searchEvent = function(search){
    var isSearchable = false;
    var search_params = {};
    search_params['sort'] = search.sort || "cust";
    search_params['keyword'] = search.keyword || "";
    search_params['district'] = search.district || "";
    search_params['sex'] = search.sex || "";
    search_params['age'] = search.age || "";
    search_params['native'] = search.native || "";
    search_params['date_from'] = search.date_from || "";
    search_params['date_to'] = search.date_to || "";
    $.each(search_params, function(key, value){
      if(value != ""){
        isSearchable = true;
      }
    });
    if(isSearchable){
      $scope.tabChange("home", search_params);
    }
  };
  
  $scope.toggleRegionSelection = function(){
    $scope.region_select = {};
    $scope.district_select = {};
    $.each(area_mapping, function(area_key, area_value){
      $.each(area_value, function(region_key, region_value){
        $scope.region_select[region_key] = region_value.text;
      });
    });
  };
  
  $scope.toggleDistrictSelection = function(key, value){
    $scope.search.region = key;
    $scope.temp.region_text = value;
    $scope.search.district = null;
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
    $scope.search.district = key;
    $scope.temp.district_text = value;
  };
  
  $scope.searchReset = function(){
    $scope.searchInit();
  };
  
  $scope.toggleSearchInput = function(){
    $scope.temp.showSearchInput = !$scope.temp.showSearchInput;
  };
  
});