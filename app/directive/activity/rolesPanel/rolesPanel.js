/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name rolesPanel
 * @description
 *  A reusable tile that will display the roles related to the selected trip
 */
angular.module('unionvmsWeb').directive('rolesPanel', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {

		},
		templateUrl: 'directive/activity/rolesPanel/rolesPanel.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});
