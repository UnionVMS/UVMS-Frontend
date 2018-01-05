/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name CatchevolutionCtrl
 * @param $scope {Service} controller scope
 * @param activityRestService {Service} the activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @param locale {Service} angular locale service
 * @description
 *  The controller for the Catch Evolution panel  
 */
angular.module('unionvmsWeb').controller('CatchevolutionCtrl', function($scope, activityRestService, locale, tripSummaryService) {
    var activityTypes = ['DEPARTURE', 'AREA_ENTRY', 'AREA_EXIT', 'FISHING_OPERATION', 'JOINT_FISHING_OPERATION', 'DISCARD', 'RELOCATION', 'TRANSHIPMENT', 'ARRIVAL', 'LANDING'];
    $scope.speciesColors = tripSummaryService.trip.specieColor;   
    $scope.sortedCatch = [];
    /**
       * Initialization function
       * 
       * @memberof CatchdetailsCtrl
       * @private
       */
    var init = function() {
        // get Catches Evolution details.
        //FIXME change with proper trip id
        activityRestService.getTripCatchesEvolution('1234').then(function(response){
            $scope.catchEvolutionData = response;
            processEvolutionData();
        }, function(error){
            //TODO deal with error from service
        });
    };
    
    function processEvolutionData(){
        angular.forEach(activityTypes, function (activityName) {
            angular.forEach($scope.catchEvolutionData.catchProgress, function(item){
                if (activityName === item.activityType) {
                    item.title = locale.getString('activity.activity_type_' + item.activityType.toLowerCase());
                    angular.forEach(item, function(chart,chartName){
                        if(chartName === 'cumulated'){
                            chart.title = locale.getString('activity.catch_evolution_title_cumulated');
                        }

                        if(angular.isDefined(chart.speciesList) && chart.speciesList.length > 0){
                            angular.forEach(chart.speciesList, function(value,key){
                                var specieCode = value.speciesCode;
                                angular.forEach($scope.speciesColors, function(item){
                                    if(specieCode === item.code){
                                        chart.speciesList[key].color = '#' + item.color;
                                    }
                                });
                            });
                        }
                    });
                    $scope.sortedCatch.push(item);
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
                angular.forEach(chart.speciesList, function(value,key){
                    var specieCode = value.speciesCode;
                        angular.forEach($scope.speciesColors, function(item){
                          if(specieCode === item.code){
                             chart.speciesList[key].color = '#' + item.color;
                             chart.speciesList[key].tableColor = {'background-color': tinycolor('#' + item.color).setAlpha(0.7).toRgbString()};
                          }
                        });
                });
            }
        });
    }

    init();
});