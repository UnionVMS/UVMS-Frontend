/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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
        showWarningMessage: function(message) {
            showMessage(message, 'WARNING');
        },
        showWarningMessageWithTimeout: function(message) {
            showMessageWithTimeout(message, 'WARNING');
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
        showActionBarMessage : function(message){
            showMessage(message, 'ACTIONBAR');
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