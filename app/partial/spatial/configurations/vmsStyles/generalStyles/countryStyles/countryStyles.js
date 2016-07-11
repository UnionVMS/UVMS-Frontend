/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('CountrystylesCtrl',function($scope, spatialConfigRestService, PreferencesService){
	$scope.itemsByPage = 25;
	$scope.searchString = '';
	$scope.countryList = [];
	$scope.prefServ = PreferencesService;
	
	//Setup data for display
    var prepareRecordsForCountryCode = function(){
    	$scope.isLoading = true;
        if ($scope.countryList.length === 0){
            getCountriesList();
        }
    };
	
    //Get list of countries
    var getCountriesList = function(){
        spatialConfigRestService.getCountriesList().then(function(response){
        	$scope.countryList = response;
    		setFsStyleArray($scope.componentStyle);
			validateCountryStyles();
        });
    };
    
    //Set proper array for styles based on countryCodes
    var setFsStyleArray = function(type){
    	if(type === 'segments' && (!$scope.configModel.stylesSettings || !$scope.configModel.stylesSettings[type] || !$scope.configModel.stylesSettings[type].style) && $scope.configModel.stylesSettings[type].attribute === 'countryCode'){
    		type = 'position';
    	}else{
    		type = 'segment';
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
        	$scope.loadedStyles = $scope.configModel.positionStyle.style;
        	$scope.displayedRecords = [].concat($scope.configModel.positionStyle.style);
        }else if($scope.componentStyle === 'segments'){
        	$scope.configModel.segmentStyle.style = style;
        	$scope.loadedStyles = $scope.configModel.segmentStyle.style;
        	$scope.displayedRecords = [].concat($scope.configModel.segmentStyle.style);
        }
        
        $scope.isLoading = false;
    };
    
    //validate the color field of the country
    $scope.validateColor = function(index){
		if(!angular.isDefined($scope.prefServ.stylesErrors[$scope.settingsLevel][$scope.componentStyle][index])){
			$scope.prefServ.stylesErrors[$scope.settingsLevel][$scope.componentStyle][index] = {};
		}

    	if($scope.loadedStyles[index].color && ($scope.loadedStyles[index].color.length <= 3 || $scope.loadedStyles[index].color.length > 7 || $scope.loadedStyles[index].color.indexOf('#') === -1)){
			addCountryError('posColor',index);
		}else{
			rmCountryError('posColor',index);
		}
		if($scope.loadedStyles[index].color !== ''){
			rmCountryError('required',index);
		}else{
			addCountryError('required',index);
		}

		if(_.isEmpty($scope.prefServ.stylesErrors[$scope.settingsLevel][$scope.componentStyle][index])){
			delete $scope.prefServ.stylesErrors[$scope.settingsLevel][$scope.componentStyle][index];
		}

		validateCountryStyles();
	};

	var addCountryError = function(errType,index){
		$scope.prefServ.stylesErrors[$scope.settingsLevel][$scope.componentStyle][index][errType] = true;
	};

	var rmCountryError = function(errType,index){
		if(angular.isDefined($scope.prefServ.stylesErrors[$scope.settingsLevel][$scope.componentStyle][index]) && angular.isDefined($scope.prefServ.stylesErrors[$scope.settingsLevel][$scope.componentStyle][index][errType])){
			delete $scope.prefServ.stylesErrors[$scope.settingsLevel][$scope.componentStyle][index][errType];
		}
	};

	var validateCountryStyles = function(){
		var errors = _.filter($scope.prefServ.stylesErrors[$scope.settingsLevel][$scope.componentStyle], function(item){
			return _.keys(item).length > 0;
		});
		if(errors && errors.length>0){
			$scope.countryListForm.$setValidity('hasError', false);
		}else{
			$scope.countryListForm.$setValidity('hasError', true);
		}
	};
	
	prepareRecordsForCountryCode();
});