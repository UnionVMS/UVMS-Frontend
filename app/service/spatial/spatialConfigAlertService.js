angular.module('unionvmsWeb').factory('spatialConfigAlertService',function($timeout,comboboxService) {

	var spatialConfigAlertService = {
	    hasAlert: false,
	    hasError: false,
	    hasSuccess: false,
	    hasWarning: false,
	    alertMessage: undefined,
	    hideAlert: function(timeoutInMilliSeconds){
	        var alertObj = this;
	        if (angular.isUndefined(timeoutInMilliSeconds)) {
	        	timeoutInMilliSeconds = 3000;
	        }
	        $timeout(function(){
	        	comboboxService.closeCurrentCombo();
	            alertObj.hasAlert = false;
	            alertObj.hasError = false;
	            alertObj.hasSuccess = false;
	            alertObj.hasWarning = false;
	            alertObj.alertMessage = undefined;
	        }, timeoutInMilliSeconds, true, alertObj);
	    }
	};
	
	return spatialConfigAlertService;
});