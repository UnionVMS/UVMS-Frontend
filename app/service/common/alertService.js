angular.module('unionvmsWeb').factory('alertService',function($timeout) {

    var currentAlert = {
        message : "",
        type : ""
    };
    var alertTimeout;

    //Show an alert message
    var showMessage = function(message, type){
        //Cancel alert timeout
        if(angular.isDefined(alertTimeout)){
            $timeout.cancel(alertTimeout);
            alertTimeout = undefined;
        }
        currentAlert.message = message;
        currentAlert.type = type;
    };

    //Show an alert message and hide it after 3 seconds
    var showMessageWithTimeout = function(message, type){
        //Show message
            showMessage(message, type);

        //Remove alert after the timout time
        var timeoutTime = 3000;
        alertTimeout = $timeout(function(){
            currentAlert.message = "";
        }, timeoutTime);
    };

	var alertService = {
        showErrorMessage : function(message){
            showMessage(message, 'ERROR');
        },
        showErrorMessageWithTimeout : function(message){
            showMessageWithTimeout(message, 'ERROR');
        },        
        showInfoMessage : function(message){
            showMessage(message, 'INFO');
        },
        showInfoMessageWithTimeout : function(message){
            showMessageWithTimeout(message, 'INFO');
        },            
        showSuccessMessage : function(message){
            showMessage(message, 'SUCCESS');
        },
        showSuccessMessageWithTimeout : function(message){
            showMessageWithTimeout(message, 'SUCCESS');
        },        
        hideMessage : function(){
            currentAlert.message = "";
        },
        getCurrentAlert : function(){
            return currentAlert;
        },


    };

	return alertService;
});