(function(){

    var validationService = function(){

        var digitsOnly = function(data){
            return /^[0-9]*$/.test(data);
        };
        var lettersOnly = function (data){
            return /^[A-ZÅÄÖa-zåäö ]*$/.test(data);
        };
        var lettersAndDigits = function(data){
            return /^[A-ZÅÄÖa-zåäö0-9 _]*[A-Za-z0-9][A-ZÅÄÖa-zåäö0-9 -]*$/.test(data);
        };

        return{
            digitsOnly: digitsOnly,
            lettersOnly: lettersOnly,
            lettersAndDigits: lettersAndDigits
        };
    };

    var module = angular.module('unionvmsWeb');
    module.factory('validationService',validationService);

}());


/*
angular.module('unionvmsWeb').factory('uvmsValidation',function() {

	var uvmsValidation = {};

	return uvmsValidation;
});*/
