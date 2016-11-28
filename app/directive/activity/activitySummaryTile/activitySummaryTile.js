/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name activitySummaryTile
 * @attr {String} faType - The title of the fieldset tile that needs to be translated
 * @attr {Object} summary - An object containing the data that should be displayed in the tile
 * @description
 *  A reusable tile that will display the summary tile of a fishing activity
 */
angular.module('unionvmsWeb').directive('activitySummaryTile', function() {
	return {
		restrict: 'E',
		replace: false,
		controller: 'ActivitySummaryTileCtrl',
		scope: {
		    faType: '@',
		    summary: '='
		},
		templateUrl: 'directive/activity/activitySummaryTile/activitySummaryTile.html'
	};
})
/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name ActivitySummaryTileCtrl
 * @param $scope {Service} The controller scope
 * @param locale {Service} The angular locale service
 * @attr {String} translatedFaType - The translated string of the fishing activity type (faType)
 * @description
 *  The controller for the activitySummaryTile directive ({@link unionvmsWeb.activitySummaryTile})
 */
.controller('ActivitySummaryTileCtrl', function($scope, locale){
    $scope.translatedFaType = locale.getString('activity.' + $scope.faType);
});
