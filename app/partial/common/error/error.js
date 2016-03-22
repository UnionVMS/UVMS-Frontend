(function() {
    'use strict';

    var app = angular.module('unionvmsWeb');

    app.controller('errorCtrl', function($scope, errorService, locale) {
        //Set texts
        $scope.error = errorService.getErrorMessage();
        //set the header text
        $scope.title = locale.getString('common.loading_page_error');
        if($scope.title.indexOf('%%KEY_NOT_FOUND%%') >= 0){
            $scope.title = 'Error loading page';
        }
        //set the error text
        $scope.errorText = locale.getString('common.loading_page_error_text');
        if($scope.errorText.indexOf('%%KEY_NOT_FOUND%%') >= 0){
            $scope.errorText = '';
        }
        //set the error details header text
        $scope.errorDetailsTitle = locale.getString('common.loading_page_error_details');
        if($scope.errorDetailsTitle.indexOf('%%KEY_NOT_FOUND%%') >= 0){
            $scope.errorDetailsTitle = 'Error details:';
        }

    });

    angular.module('unionvmsWeb')
        .factory('errorService',function() {

            var errorMessage;
            return {
                getErrorMessage : function(){
                    return errorMessage;
                },
                setErrorMessage : function(message){
                    errorMessage = message;
                },
            };
        });
})();
