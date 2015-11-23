angular.module('unionvmsWeb').factory('vesselValidationService',function() {

	var vesselValidationService = {
        getCFRPattern : function(){
            //3 letters followed by 9 digits
            return new RegExp(/^[a-zA-Z]{3}[0-9]{9}$/);
        },
        getMMSIPattern : function(){
            //9 digits
            return new RegExp(/^[0-9]{9}$/);
        },
        getMaxTwoDecimalsPattern : function(){
            return new RegExp(/^[0-9]+([,.][0-9]{0,2}?)?$/);
        }
    };

	return vesselValidationService;
});