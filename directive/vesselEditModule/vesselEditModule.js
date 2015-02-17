angular.module('unionvmsWeb')
    .controller('vesselEditCtrl', function($scope){

    })
    .directive('vesseleditmodule', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'directive/vesseleditmodule/vesseleditmodule.html'
        };
    });

