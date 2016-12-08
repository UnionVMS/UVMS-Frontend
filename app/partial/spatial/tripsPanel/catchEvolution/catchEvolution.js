
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

        angular.forEach($scope.catchEvolutionData.catchProgress, function(item){
            angular.forEach(item, function(chart,chartName){
                if(chartName === 'cumulated'){
                    chart.title = locale.getString('activity.catch_evolution_title_cumulated');
                }

                if(angular.isDefined(chart.speciesList) && chart.speciesList.length > 0){
                    var colors = palette('tol-rainbow', chart.speciesList.length);
                    angular.forEach(chart.speciesList, function(value,key){
                        chart.speciesList[key].color = '#' + colors[key];
                    });
                }
            });
        });

        angular.forEach($scope.catchEvolutionData.finalCatch, function(chart,chartName){
            if(chartName === 'cumulated'){
                chart.title = locale.getString('activity.catch_evolution_title_cumulated_catch');
            }else if(chartName === 'landed'){
                chart.title = locale.getString('activity.catch_panel_title_landed');
            }

            if(angular.isDefined(chart.speciesList) && chart.speciesList.length > 0){
                var colors = palette('tol-rainbow', chart.speciesList.length);
                angular.forEach(chart.speciesList, function(value,key){
                    chart.speciesList[key].color = '#' + colors[key];
                    chart.speciesList[key].tableColor = {'background-color': tinycolor('#' + colors[key]).setAlpha(0.7).toRgbString()};
                });
            }
        });
    };

    init();
});