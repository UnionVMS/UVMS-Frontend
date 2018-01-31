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
angular.module('unionvmsWeb').controller('CatchevolutionCtrl', function ($scope, activityRestService, locale, tripSummaryService, loadingStatus) {
    $scope.sencondLevel = [];
    $scope.thirdLevel = [];

    $scope.speciesColors = tripSummaryService.trip.specieColor;

    /**
       * Initialization function
       * 
       * @memberof CatchdetailsCtrl
       * @private
       */
    var init = function () {
       
        if (angular.isDefined(tripSummaryService.trip)) {
            loadingStatus.isLoading('TripSummary', true, 2);
            $scope.tripId = tripSummaryService.trip.id;
            // get Catches Evolution details.
            activityRestService.getTripCatchesEvolution($scope.tripId).then(function (response) {
                $scope.catchEvolutionData = response;
                processEvolutionData();
                
            }, function (error) {
                loadingStatus.isLoading('TripSummary', false);
                //TODO deal with error from service
            });
        }


    };

    function comparisionCharts(data, chartName, thirdLevel) {
        if (thirdLevel === true) {
            $scope.thirdLevel.push({
                'catchEvolution': {
                    'cumulative': data.catchEvolution[chartName]
                },
                'title': data.title
            });
        } else {
            $scope.sencondLevel.push({
                'catchEvolution': {
                    'cumulative': data.catchEvolution[chartName]
                },
                'title': data.title
            });
        }
    }

    function prepareChartData(actiType, repType, level) {
        var temp = _.where($scope.catchEvolutionData.catchProgress, { activityType: actiType, reportType: repType });

        if (temp.length > 0) {
            comparisionCharts(_.last(temp), '0onboard', level);
        }
    }

    function processEvolutionData() {
        angular.forEach($scope.catchEvolutionData.catchProgress, function (item) {
            item.title = locale.getString('activity.activity_type_' + item.activityType.toLowerCase()) + ' (' + locale.getString('activity.' + item.reportType.toLowerCase()) + ')';
            item.catchEvolution['0onboard'] = item.catchEvolution.onboard;
            item.catchEvolution['1cumulated'] = item.catchEvolution.cumulated;
            delete item.catchEvolution.onboard;
            delete item.catchEvolution.cumulated;
            angular.forEach(item.catchEvolution, function (chart, chartName) {
                if (chartName.indexOf('cumulated') !== -1) {
                    chart.title = locale.getString('activity.catch_evolution_title_cumulated');
                }
                if (angular.isDefined(chart.speciesList) && chart.speciesList.length > 0) {
                    angular.forEach(chart.speciesList, function (value, key) {
                        var specieCode = value.speciesCode;
                        angular.forEach($scope.speciesColors, function (item) {
                            if (specieCode === item.code) {
                                chart.speciesList[key].color = '#' + item.color;
                            }
                        });
                    });
                }
            });
        });

        //second level chart:1
        var lastchart = _.last($scope.catchEvolutionData.catchProgress);
        if(lastchart !== null){
            comparisionCharts(_.last($scope.catchEvolutionData.catchProgress), '1cumulated');
        }
        //second level chart:2
        prepareChartData('ARRIVAL', 'NOTIFICATION');
        //second level chart:3
        prepareChartData('LANDING', 'DECLARATION');

        // thrid level chart:1
        var tranOrderID = _.where($scope.catchEvolutionData.catchProgress, { activityType: 'TRANSHIPMENT' })
        if (tranOrderID.length > 0) {
            var trandata = _.where($scope.catchEvolutionData.catchProgress, { orderId: tranOrderID[0].orderId - 1 });
            if (trandata.length > 0) {
                comparisionCharts(_.last(trandata), '1cumulated', true);
            }
        }
        // thrid level chart:2
        prepareChartData('TRANSHIPMENT', 'NOTIFICATION', true);
        // thrid level chart:3
        var landecl = _.where($scope.catchEvolutionData.catchProgress, { activityType: 'LANDING', reportType: 'DECLARATION' });
        if (landecl.length === 0) {
            prepareChartData('TRANSHIPMENT', 'DECLARATION', true);
        } else {
            prepareChartData('LANDING', 'DECLARATION', true);
        }
        loadingStatus.isLoading('TripSummary', false);
    }

    init();
});