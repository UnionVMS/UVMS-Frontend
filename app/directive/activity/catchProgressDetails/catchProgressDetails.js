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
 * @ngdoc directive
 * @name catchPanel
 * @param locale {Service} The angular locale service
 * @attr {Object} data - The data object used as input for the directive
 * @attr {String} date - Date to display
 * @attr {String} unit - The weight unit to be used for the directive
 * @description
 *  A reusable tile that will display pie charts
 */
angular.module('unionvmsWeb').directive('catchProgressDetails', function(locale, $compile, $modal) {

    return {
        restrict: 'E',
        replace: false,
        scope: {
            data: '=?',
            date: '@?',
            unit: '@?'
        },
        templateUrl: 'directive/activity/catchProgressDetails/catchProgressDetails.html',
        link: function(scope, element, attrs, fn) {
            scope.options = {
                chart: {
                    type: 'pieChart',
                    height: 140,
                    x: function(d){
                        return d.speciesCode;
                    },
                    y: function(d){
                        return d.weight;
                    },
                    color: function(d) {
                        return d.color
                    },
                    showLegend: false,
                    showLabels: false,
                    pie: {
                        dispatch: {
                            elementClick: function(e){
                                var modalInstance = $modal.open({
                                    templateUrl: 'partial/activity/pieChartModal/pieChartModal.html',
                                    controller: 'PiechartmodalCtrl',
                                    size: 'md',
                                    resolve: {
                                        modalData: function() {
                                            return e.data;
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }

            var graphs = [
                'previousCumulative',
                'total',
                'loaded',
                'onBoard',
                'unLoaded',
                'cumulative'
            ];


            // Count number of graphs that need to be shown
            function getGraphOccurences() {
                var occurenceCounter = 0;
                var keys = Object.keys(scope.data);
                angular.forEach(keys, function(key) {
                    if (graphs.indexOf(key) > -1 && scope.data[key].length) {
                        occurenceCounter++;
                    }
                },this);
                return occurenceCounter;
            };

            // Get graph css class for each activity according to number of graphs that need to be shown
            function getGraphClass() {
                var occurences = getGraphOccurences();
                switch(occurences) {
                    case 1:
                      return 'col-md-12 col-lg-12 col-xs-12';
                    case 2:
                      return 'col-md-6 col-lg-6 col-xs-6';
                    case 3:
                      return 'col-md-4 col-lg-4 col-xs-4';
                    case 4:
                      return 'col-md-3 col-lg-3 col-xs-3';
                    case 5:
                      return 'col-md-2 col-lg-2 col-xs-2';
                    default:
                      return '';
                }
            }

            scope.graphClass = getGraphClass();
        }
    };
});
