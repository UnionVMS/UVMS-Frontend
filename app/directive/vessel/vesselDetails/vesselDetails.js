angular.module('unionvmsWeb')
.controller('vesselDetailsCtrl', function($scope, vessel, $route){

    })
    .directive('vesselDetails', function() {
	return {
		restrict: 'E',
		replace: false,
        //scope: true,
		templateUrl: 'directive/vessel/vesselDetails/vesselDetails.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});
