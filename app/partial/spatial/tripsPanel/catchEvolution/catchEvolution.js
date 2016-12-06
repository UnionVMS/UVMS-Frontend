
/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name CatchevolutionCtrl
 * @param $scope {Service} controller scope
 * @param activityRestService {Service} the activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @param loadingStatus {Service} the loading status service <p>{@link unionvmsWeb.loadingStatus}</p>
 * @param $anchorScroll {Service} angular $anchorScroll service
 * @param locale {Service} angular locale service
 * @description
 *  The controller for the Catch Evolution.  
 */
angular.module('unionvmsWeb').controller('CatchevolutionCtrl', function($scope, activityRestService, loadingStatus, $anchorScroll, locale) {
   // data for field-data attribute with tables.
    $scope.panelData = {
        tableShown: true,
        subTitle: [locale.getString('activity.catch_panel_title_landed'), locale.getString('activity.catch_evolution_title_cumulated_catch')],
        loadingScreen: "CatchEvolution",
        colWidth: 6
    };
     // data for field-data attribute without tables.
    $scope.panelDataWithOutTable = {
        "tableShown": false,
        "subTitle": ["", locale.getString('activity.catch_evolution_title_cumulated')],
        "loadingScreen": "CatchEvolution",
        "colWidth": "12"
    };
    /**
       * Initialization function
       * 
       * @memberof CatchdetailsCtrl
       * @private
       */
    var init = function() {
        // get fishing trip details.
        $scope.fishingTripDetails = activityRestService.getTripCatchDetail('1234');
        // get Catches Evolution details.
        $scope.catchEvolutionData = activityRestService.getTripCatchesEvolution('1234');

    }
    init();
});