angular.module('unionvmsWeb').factory('areaAlertService',function($timeout) {

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
	    }
	};

	return areaAlertService;
});