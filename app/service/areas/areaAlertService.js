angular.module('unionvmsWeb').factory('areaAlertService',function($timeout) {

	var areaAlertService = {
        hasAlert: false,
        hasError: false,
        hasSuccess: false,
        hasWarning: false,
        alertMessage: undefined,
        isLoading: undefined,
        loadingMessage: undefined,
        hideAlert: function(){
            var alertObj = this;
            $timeout(function(){
                alertObj.hasAlert = false;
                alertObj.hasError = false;
                alertObj.hasSuccess = false;
                alertObj.hasWarning = false;
                alertObj.alertMessage = undefined;
            }, 3000, true, alertObj);
        },
	    setError: function(){
	        this.hasAlert = true;
	        this.hasError = true;
	    },
	    setWarning: function(){
	        this.hasAlert = true;
            this.hasWarning = true;
	    },
	    setSuccess: function(){
	        this.hasAlert = true;
            this.hasSuccess = true;
	    },
	    setLoading: function(msg){
	        this.isLoading = true;
	        this.loadingMessage = msg;
	    },
	    removeLoading: function(){
	        this.isLoading = false;
            this.loadingMessage = undefined;
	    }
	};

	return areaAlertService;
});