// This is a test app for testing bootstrapping of angular js 1.7.5
var app = angular.module('app175', []).
    controller('MyController', ['$scope', function ($scope) {
        $scope.greetMe = 'angular js 1.7.5';
    }]);

angular.element(document).ready(function() {
    angular.bootstrap(document, ["app175"]);
});