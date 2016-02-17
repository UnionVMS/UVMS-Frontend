angular.module('unionvmsWeb').controller('FooterCtrl',function($scope, envConfig){
    $scope.envName = envConfig.env_name;
    $scope.apiURL = envConfig.rest_api_base;
    $scope.fullYear = new Date().getFullYear();
});