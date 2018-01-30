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
 * @attr {Object} ngModel - The data object used as input for the directive
 * @attr {Boolean} withTable - Whether the panel should include or not a data table
 * @attr {String} title - title for the catch panel
 * @attr {Boolean} isLoading - Whether teh parent container is still loading or not
 * @attr {String} unit - The weight unit to be used for the directive
 * @attr {Number} height - The height for the chart
 * @description
 *  A reusable tile that will display two pie charts side-by-side, and optionally a table and caption for the input data 
 */
angular.module('unionvmsWeb').directive('catchPanel', function(locale, $compile, $modal) {
    return {
        restrict: 'E',
        replace: false,
        scope: {
            ngModel: '=',
            withTable: '@',
            onePanel: '@',
            title: '@',
            isLoading: '=',
            unit: '@',
            height: '@'
        },
        templateUrl: 'directive/activity/catchPanel/catchPanel.html',
        link: function(scope, element, attrs, fn) {
            
            scope.element = element;

            /**
			 * Initialize the charts with nvd3 properties
			 * 
			 * @memberof catchPanel
			 * @private
			 */
            var initCharts = function() {
                scope.options = {};
                scope.catchPerArea = "";
                angular.forEach(scope.ngModel, function(chartData, currentChart) {
                    var chartOptions = {
                        chart: {
                            type: 'pieChart',
                            height: scope.height,
                            x: function(d) { return d.speciesCode; },
                            y: function(d) {
                                return d.weight;
                            },
                            valueFormat: function (d) {
                                return scope.formatWeight(d, chartData.total, scope.displayedUnit);
                            },
                            showLabels: false,
                            duration: 500,
                            color: function(d, i) {
                                return chartData.speciesList[i].color;
                            },
                            showLegend: false,
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
                    };
                    scope.options[currentChart] = chartOptions;
                });
            };

			/**
			 * function to calculate species Weight Percentage and return a string to be displayed in the chart tooltip
			 * 
			 * @memberof catchPanel
			 * @public
			 * @alias formatWeight
			 * @param {Object} specieWeight - individual species weight
			 * @param {Object} weightType - weight unit
			 * @param {Object} totalWeight - total weight for the species
			 */
            scope.formatWeight = function(specieWeight, totalWeight, weightUnit) {
                var value = specieWeight / totalWeight * 100;
                return specieWeight.toFixed(3) + ' ' + weightUnit + ' (' + value.toFixed(2) + '%)';
            };

            //when the trip is initialized
            scope.$watch('ngModel', function () {
                //TODO init must be called if the data is already loaded before the directive compilation
                init();
            });
            
            //To automatically refresh the charts in order to avoid sizing problems
            scope.$watch(function() { return angular.element(scope.element).is(':visible'); }, function(newVal) {
                if (newVal){
                    angular.forEach(scope.options, function(value, key) {
                        if (angular.isDefined(value.api)){
                            value.api.refresh();
                        }
                    });
                }
            });

			/**
			 * Initializes the catch panel directive
			 * 
			 * @memberof catchPanel
			 * @private
			 */
            var init = function() {
                scope.displayedUnit = locale.getString('activity.weight_unit_' + scope.unit);
                initCharts();
            };

        }
    };
});
