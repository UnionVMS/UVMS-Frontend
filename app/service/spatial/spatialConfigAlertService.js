angular.module('unionvmsWeb').factory('spatialConfigAlertService',function($timeout) {

	var spatialConfigAlertService = {
	    hasAlert: false,
	    hasError: false,
	    hasSuccess: false,
	    hasWarning: false,
	    alertMessage: undefined,
	    hideAlert: function(){
	        var alertObj = this;
	        $timeout(function(){
	            alertObj.hasAlert = false;
	            alertObj.hasError = false;
	            alertObj.hasSuccess = false;
	            alertObj.hasWarning = false;
	            alertObj.alertMessage = undefined;
	        }, 3000, true, alertObj);
	    }
	};
	
	return spatialConfigAlertService;
});