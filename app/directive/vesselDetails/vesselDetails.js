angular.module('unionvmsWeb')
.controller('vesselDetailsCtrl', function($scope, vessel, $route){

    })
    .directive('vesselDetails', function() {
	return {
		restrict: 'E',
		replace: false,

		templateUrl: 'directive/vesselDetails/vesselDetails.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});
