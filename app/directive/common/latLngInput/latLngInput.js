//Input fields for latitude and longitude
angular.module('unionvmsWeb').directive('latInput', function($compile) {
	return {
		restrict: 'E',
		replace: true,
        controller : 'latLngInputCtrl',
		scope: {
            model : '=',
            ngDisabled : '=',
            ngRequired : '=',
		},
        template: '<input type="text" class="form-control" ng-model="viewModel" ng-disabled="ngDisabled" ng-required="ngRequired" ng-change="onChange()" ng-blur="onBlur()" latitude  ng-pattern="coordPattern">',
        compile: function(element, attrs) {
            //Add input name if name attribute exists
            var name = attrs.name;
            if (name) {
                $(element).attr('name', name);
            }
        },

	};
});
angular.module('unionvmsWeb').directive('lngInput', function($compile) {
    return {
        restrict: 'E',
        replace: true,
        controller : 'latLngInputCtrl',
        scope: {
            model : '=',
            ngDisabled : '=',
            ngRequired : '=',
        },
        template: '<input type="text" class="form-control" ng-model="viewModel" ng-disabled="ngDisabled" ng-required="ngRequired" ng-change="onChange()" ng-blur="onBlur()" longitude  ng-pattern="coordPattern">',
        compile: function(element, attrs) {
            //Add input name if name attribute exists
            var name = attrs.name;
            if (name) {
                $(element).attr('name', name);
            }
        },

    };
});

angular.module('unionvmsWeb')
    .controller('latLngInputCtrl', function($log, $scope, $timeout, coordinateFormatService, globalSettingsService){

        var formatConfigs  = {
            DECIMAL_MINUTES : {
                blankValue : "00° 00,000′",
                pattern : new RegExp(/^[+-]?\d{1,3}°?\s\d{1,2}(,\d{0,3})?[′']?$/),
            },
            DECIMAL : {
                blankValue : "00.000",
                pattern : new RegExp(/^[+-]?\d{1,3}([\.,]+\d{0,3})?$/), //0-3 decimals
            }
        };

        //Get format from global settings
        var configFormat = globalSettingsService.getCoordinateFormat();
        switch(configFormat){
            case 'degreesMinutesSeconds':
                $scope.coordinateFormat = "DECIMAL_MINUTES";
                break;
            case 'decimalDegrees':
                $scope.coordinateFormat = "DECIMAL";
                break;
            default:
                $log.warn("Invalid or missing coordinate format. Using decimal degrees.");
                $scope.coordinateFormat = "DECIMAL";
                break;
        }

        $scope.coordPattern = formatConfigs[$scope.coordinateFormat].pattern;

        //Update model value
        var updateModelValue = function(){
            watchModelChange = false;
            //Input value exists?
            if(angular.isDefined($scope.viewModel) && String($scope.viewModel).trim().length > 0){
                if($scope.coordinateFormat === 'DECIMAL'){
                    $scope.model = $scope.viewModel;
                }
                //DECIMAL_MINUTES
                else{
                    var decimalValue = coordinateFormatService.toDecimalDegrees($scope.viewModel, -1);
                    $scope.model = decimalValue;
                }
            }else{
                $scope.model = undefined;
            }
        };

        //Update model value on input change
        var watchModelChange = true;
        var onChangeTimeout;
        $scope.onChange = function(){
            $timeout.cancel(onChangeTimeout);
            onChangeTimeout = $timeout(updateModelValue, 300);
        };

        //Format viewValue on blur
        $scope.onBlur = function(){
            if(angular.isDefined($scope.viewModel) && String($scope.viewModel).trim().length > 0){
                //Format viewModel with degree sign
                if($scope.coordinateFormat === 'DECIMAL_MINUTES'){
                    //No need to format the blankValue
                    if($scope.viewModel !== formatConfigs[$scope.coordinateFormat].blankValue){
                        var decimalMinutesValue = coordinateFormatService.toDegreesWithDecimalMinutes($scope.viewModel, 3); //3 decimals;
                        if(decimalMinutesValue !== $scope.viewModel){
                            $scope.viewModel = decimalMinutesValue;
                        }
                    }
                }
            }
        };

        //Watch the model for changes and update viewModel when model is changd
        $scope.$watch('model', function(newValue, oldValue) {
            if(watchModelChange){
                if(angular.isDefined(newValue)){
                    if($scope.coordinateFormat === 'DECIMAL'){
                        var decimalDegrees = coordinateFormatService.toDecimalDegrees(newValue, 3); //3 decimals
                        $scope.viewModel = decimalDegrees;
                    }
                    //DECIMAL_MINUTES
                    else{
                        var decimalMinutes = coordinateFormatService.toDegreesWithDecimalMinutes(newValue, 3); //3 decimals
                        $scope.viewModel = decimalMinutes;
                    }
                }else{
                    $scope.viewModel = formatConfigs[$scope.coordinateFormat].blankValue;
                    //Update the model value
                    updateModelValue();
                }
            }
            watchModelChange = true;
        });


        //Set to blank value from start
        if(angular.isUndefined($scope.model)){
            $scope.viewModel = formatConfigs[$scope.coordinateFormat].blankValue;
        }
});