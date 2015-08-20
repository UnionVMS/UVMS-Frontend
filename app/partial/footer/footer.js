angular.module('unionvmsWeb').controller('FooterCtrl',function($scope, restConstants){
    $scope.envName = restConstants.envName;
    $scope.apiURL = restConstants.baseUrl;
});