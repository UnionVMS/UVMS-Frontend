angular.module('unionvmsWeb').factory('areaAlertService',function($timeout,comboboxService) {

	var areaAlertService = {
        hasAlert: false,
        alertType: undefined,
        alertMessage: undefined,
        isLoading: undefined,
        loadingMessage: undefined,
	    setError: function(){
	        this.hasAlert = true;
	        this.alertType = 'danger';
	    },
	    setWarning: function(){
	        this.hasAlert = true;
	        this.alertType = 'warning';
	    },
	    setSuccess: function(){
	        this.hasAlert = true;
	        this.alertType = 'success';
	    },
	    setLoading: function(msg){
	        this.isLoading = true;
	        this.loadingMessage = msg;
	    },
	    removeLoading: function(){
	        this.isLoading = false;
            this.loadingMessage = undefined;
	    },
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

	return areaAlertService;
});