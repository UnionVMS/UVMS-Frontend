angular.module('unionvmsWeb').controller('CountrystylesCtrl',function($scope, spatialConfigRestService){
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
    		$scope.setFsStyleArray($scope.componentStyle);
        });
    };
    
    //Set proper array for styles based on countryCodes
    $scope.setFsStyleArray = function(type){
    	if(type === 'segments' && (!$scope.configModel.stylesSettings || !$scope.configModel.stylesSettings[type] || !$scope.configModel.stylesSettings[type].style || !$scope.configModel.stylesSettings[type].attribute !== 'countryCode')){
    		type = 'positions';
    	}
        var keys = _.keys($scope.countryList);
        var style = [];
        
        angular.forEach(keys, function(key){
            style.push({
               code: key,
               name: $scope.countryList[key],
               color: angular.isDefined($scope.configModel.stylesSettings) && angular.isDefined($scope.configModel.stylesSettings[$scope.componentStyle]) && angular.isDefined($scope.configModel.stylesSettings[$scope.componentStyle].style) && angular.isDefined($scope.configModel.stylesSettings[$scope.componentStyle].style[key]) ? $scope.configModel.stylesSettings[$scope.componentStyle].style[key] : $scope.generateRandomColor() 
            });
        });
        
        if($scope.componentStyle === 'positions'){
        	$scope.configModel.positionStyle.style = style;
        	$scope.displayedRecords = [].concat($scope.configModel.positionStyle.style);
        }else if($scope.componentStyle === 'segments'){
        	$scope.configModel.segmentStyle.style = style;
        	$scope.displayedRecords = [].concat($scope.configModel.segmentStyle.style);
        }
        
    };
    
    //validate the color field of the country
    $scope.validateColor = function(index){
    	var indexOnModel;
    	if($scope.componentStyle === 'positions'){
    		indexOnModel = $scope.configModel.positionStyle.style.indexOf($scope.displayedRecords[index]);
    	}else if($scope.componentStyle === 'segments'){
    		indexOnModel = $scope.configModel.segmentStyle.style.indexOf($scope.displayedRecords[index]);
    	}else{
    		return;
    	}
    	if($scope.displayedRecords[index].color && ($scope.displayedRecords[index].color.length <= 3 || $scope.displayedRecords[index].color.length > 7 || $scope.displayedRecords[index].color.indexOf('#') === -1)){
			$scope.countryListForm['countryForm' + index].countryColor.$setValidity('posColor' + indexOnModel, false);
		}else{
			$scope.countryListForm['countryForm' + index].countryColor.$setValidity('posColor' + indexOnModel, true);
		}
		if($scope.displayedRecords[index].color !== ''){
			$scope.countryListForm['countryForm' + index].countryColor.$setValidity('required' + indexOnModel, true);
		}else{
			$scope.countryListForm['countryForm' + index].countryColor.$setValidity('required' + indexOnModel, false);
		}
		if($scope.countryListForm.$valid || $scope.getNrErrors() === 1 && $scope.countryListForm.$error.hasError){
			$scope.countryListForm.$setValidity('hasError', true);
		}else{
			$scope.countryListForm.$setValidity('hasError', false);
		}
	};
	
	$scope.generateRandomColor = function(){
		var color = "#";
	    var possible = "0123456789";
	    for( var i=0; i < 6; i++ ){
	        color += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    return color;
	}
	
   $scope.prepareRecordsForCountryCode();
});