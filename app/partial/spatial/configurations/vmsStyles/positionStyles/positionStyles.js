angular.module('unionvmsWeb').controller('PositionstylesCtrl',function($scope, spatialConfigRestService){

	$scope.itemsByPage = 25;
	$scope.searchString = '';
	$scope.countryList = [];
    
	//Setup data for display
    $scope.prepareRecordsForCountryCode = function(){
        if ($scope.countryList.length === 0){
            $scope.getCountriesList();
        }
    };
	
    //Get list of countries
    $scope.getCountriesList = function(){
        spatialConfigRestService.getCountriesList().then(function(response){
        	$scope.countryList = response;
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
               name: $scope.countryList[key],
               color: $scope.configModel.stylesSettings.positions.style[key]
            });
        });
        
        $scope.configModel.posFsStyle = style;
        
        $scope.displayedRecords = [].concat($scope.configModel.posFsStyle);
    };
    
    //validate the color field of the country
    $scope.validateColor = function(index){
    	var indexOnModel = $scope.configModel.posFsStyle.indexOf($scope.displayedRecords[index]);
    	if($scope.displayedRecords[index].color && ($scope.displayedRecords[index].color.length <= 3 || $scope.displayedRecords[index].color.indexOf('#') === -1)){
			$scope.countryListForm.$setValidity('posColor' + indexOnModel, false);
		}else{
			$scope.countryListForm.$setValidity('posColor' + indexOnModel, true);
		}
		if($scope.displayedRecords[index].color !== ''){
			$scope.countryListForm.$setValidity('required' + indexOnModel, true);
		}else{
			$scope.countryListForm.$setValidity('required' + indexOnModel, false);
		}
	};
    
    $scope.$watch('configModel.stylesSettings.positions.attribute', function(newVal, oldVal){
       if (newVal === 'countryCode'){
           $scope.prepareRecordsForCountryCode();
       } 
    });
});