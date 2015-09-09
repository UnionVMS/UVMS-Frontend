var app = angular.module('unionvmsWeb');

app.controller('errorCtrl', function($scope, errorService) {
    $scope.error = errorService.getErrorMessage();
  
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