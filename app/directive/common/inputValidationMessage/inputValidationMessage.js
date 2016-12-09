/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').directive('inputValidationMessage', function() {
	return {
		restrict: 'E',
		replace: true,
        controller : 'inputValidationMessageCtrl',
		scope: {
            types : '@',
            input: '='
		},
		templateUrl: 'directive/common/inputValidationMessage/inputValidationMessage.html',
		link: function(scope, element, attrs, fn) {
            scope.customMessages = {};
            if('customMessages' in attrs){
                scope.customMessages = scope.$eval(attrs["customMessages"]);
            }
		}
	};
});


angular.module('unionvmsWeb').controller('inputValidationMessageCtrl',function($scope, locale){
    $scope.validationTypes = [];
    $.each($scope.types.split(","), function(index, value){
        $scope.validationTypes.push(value.trim());
    });

    //Validation error messages
    var messages = {
        'required' : locale.getString('common.validation_required'),
        'maxlength' : locale.getString('common.validation_invalid_maxlength'),
        'minlength' : locale.getString('common.validation_invalid_minlength'),
        'pattern' : locale.getString('common.validation_invalid_pattern'),
        'date' : locale.getString('common.validation_invalid_date'),
        'maxDate' : locale.getString('common.validation_invalid_max_date'),
        'minDate' : locale.getString('common.validation_invalid_min_date'),
        'time' : locale.getString('common.validation_invalid_time'),
        'period' : locale.getString('common.validation_invalid_period'),
        'number' : locale.getString('common.validation_digits_only'),
        'onlyDigits' : locale.getString('common.validation_digits_only'),
        'onlyLetters' : locale.getString('common.validation_letters_only'),
        'numeric' : locale.getString('common.validation_invalid_numeric'),
        'latitude': locale.getString('movement.validation_invalid_latitude'),
        'longitude': locale.getString('movement.validation_invalid_longitude'),
        'email': locale.getString('common.validation_invalid_email'),
        'unique': locale.getString('common.validation_not_unique')
    };

    //Get validation error message
    $scope.getMessage = function(type){
        //First check customMessages
        var message = $scope.customMessages[type];

        //If not found, check default messages
        if(angular.isUndefined(message)){
            message = messages[type];
        }

        //If not found set message to "invalid"
        if(angular.isUndefined(message)){
            message = locale.getString('common.invalid');
        }
        return message;
    };

    //Check if a validation message should be shown or not
    $scope.showValidationMessage = function(type){
        if(angular.isUndefined($scope.input)){
            return false;
        }
        return $scope.input.$error[type];
    };

});