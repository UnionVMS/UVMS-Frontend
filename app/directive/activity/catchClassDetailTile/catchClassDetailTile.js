/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name catchClassDetailTile
 * @attr {String} fieldTitle - The title of the fieldset tile
 * @description
 *  A reusable tile that will display the details of a catch. It is used in several partials such as departurePanel and arrivalPanel 
 */
angular.module('unionvmsWeb').directive('catchClassDetailTile', function() {
	return {
		restrict: 'E',
		replace: false,
		controller: 'CatchClassDetailTileCtrl',
		scope: {
		    tileTitle: '@',
		    ngModel: '=',
		    isLocationClickable: '=',
		    bufferDistance: '@',
		    clickCallback: '&'
		},
		templateUrl: 'directive/activity/catchClassDetailTile/catchClassDetailTile.html',
		link: function(scope, element, attrs, fn) {
		    scope.init();
		}
	};
}).
/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name CatchClassDetailTileCtrl
 * @param $scope {Service} The controller scope
 * @param locale {Service} The angular locale service
 * @description
 *  The controller for the catchClassDetailTile directive ({@link unionvmsWeb.catchClassDetailTile})
 */
controller('CatchClassDetailTileCtrl', function($scope, locale){
    $scope.selected = {};
    $scope.init = function(){
        $scope.selected = $scope.ngModel[0];
        $scope.selected.total = parseFloat($scope.selected.lsc) + parseFloat($scope.selected.bms);
        var title = 'activity.location';
        if ($scope.selected.locations.length > 1){
            title += 's'
        }
        $scope.locationTitle = locale.getString(title);
    };
});
