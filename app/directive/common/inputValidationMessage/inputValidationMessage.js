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
        'date' : locale.getString('common.validation_invalid_date'),
        'time' : locale.getString('common.validation_invalid_time'),
        'number' : locale.getString('common.validation_digits_only'),
        'onlyDigits' : locale.getString('common.validation_digits_only'),
        'onlyLetters' : locale.getString('common.validation_letters_only')
    };

    //Get validation error message
    $scope.getMessage = function(type){
        var message = messages[type];
        if(angular.isUndefined(message)){
            message = locale.getString('common.invalid');
        }
        return message;
    };

    //Check if a validation message should be shown or not
    $scope.showValidationMessage = function(type){
        return $scope.input.$error[type];
    };

});
