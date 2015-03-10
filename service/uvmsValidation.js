(function(){

    var uvmsValidation = function(){

        var digitsOnly = function(data){

            return "/^[0-9]*$/";
        };
         var lettersOnly = function (){
             return "/^[A-ZÅÄÖa-zåäö]*$/";
         };

        return{
            digitsOnly: digitsOnly,
            lettersOnly: lettersOnly
        };
    };

    var module = angular.module('unionvmsWeb');
    module.factory('uvmsValidation',uvmsValidation);

}());


/*
angular.module('unionvmsWeb').factory('uvmsValidation',function() {

	var uvmsValidation = {};

	return uvmsValidation;
});*/
