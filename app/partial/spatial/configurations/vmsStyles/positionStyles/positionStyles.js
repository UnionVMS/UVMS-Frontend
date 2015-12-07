angular.module('unionvmsWeb').controller('PositionstylesCtrl',function($scope, spatialConfigRestService){

	$scope.itemsByPage = 25;
	$scope.searchString = '';
	$scope.countryList = [];
    
	//Setup data for display
    $scope.prepareRecordsForCountryCode = function(){
        if ($scope.countryList.length === 0){
            $scope.getCountriesList();
        }
    }
	
    //Get list of countries
    $scope.getCountriesList = function(){
        spatialConfigRestService.getCountriesList().then(function(response){
            countryList = response;
            $scope.setFsStyleArray();
        });
    };
    
    //Set proper array for styles based on countryCodes
    $scope.setFsStyleArray = function(type){
        var keys = _.keys($scope.configModel.stylesSettings.positions.style);
        var style = [];
        
        angular.forEach(keys, function(key){
            style.push({
               code: key,
               name: countryList[key],
               color: $scope.configModel.stylesSettings.positions.style[key]
            });
        });
        
        $scope.configModel.posFsStyle = style;
        
        $scope.displayedRecords = [].concat($scope.configModel.posFsStyle);
    };
    
    $scope.$watch('configModel.stylesSettings.positions.attribute', function(newVal, oldVal){
       if (newVal === 'countryCode'){
           $scope.prepareRecordsForCountryCode();
       } 
    });
});