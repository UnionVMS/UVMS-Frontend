/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name RolescarouselCtrl
 * @param $scope {Service} The controller scope
 * @param $timeout {Service} The angular timeout
 * @param tripSummaryService {Service} The trip summary service <p>{@link unionvmsWeb.tripSummaryService}</p>
 * @attr {Object} currentRole - The current displayed role in the roles carousel
 * @description
 *  The controller for the mapTile directive ({@link unionvmsWeb.mapTile})
 */
angular.module('unionvmsWeb').controller('RolescarouselCtrl',function($scope,$timeout,tripSummaryService){

    $scope.tripSummServ = tripSummaryService;
    $scope.currentRole = {index: 0};

    /**
     * Update combobox when the carousel changes
     * 
     * @memberof RolescarouselCtrl
     * @public
     * @alias updateCombo
     * @param {Array} slides - array containing the slides of the carousel
     */
    $scope.updateCombo = function(slides) {
        $timeout(function() {
            $scope.currentRole.index = _.where(slides,{'active': true})[0].index;
        }, 1);
    };
});