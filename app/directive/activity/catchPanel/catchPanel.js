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
angular.module('unionvmsWeb').directive('catchPanel', function(locale, $compile) {
    return {
        restrict: 'E',
        replace: false,
        scope: {
            ngModel: '=',
            withTable: '@',
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
                                scope.catchPerArea = d.catchPerArea;
                                return d.weight;
                            },
                            valueFormat: function (d) {
                                return scope.formatWeight(d, chartData.total, scope.displayedUnit, scope.catchPerArea);
                            },
                            showLabels: false,
                            duration: 500,
                            color: function(d, i) {
                                return chartData.speciesList[i].color;
                            },
                            showLegend: false
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
            scope.formatWeight = function(specieWeight, totalWeight, weightUnit, catchesPerArea) {
                var value = specieWeight / totalWeight * 100;
                var formattedCatches = "<div class='table'>" + "<div class='thead'><div class='tr' style='border-bottom:0'><div class='th' style='padding-bottom:0'>Area</div><div class='th' style='padding-bottom:0'>Weight</div></div></div>" + "<div class='tbody'>" + catchesPerArea + "</div>" + "</div>";
                return specieWeight + weightUnit + ' (' + value.toFixed(2) + '%) ' + '<br>' + formattedCatches;
            };

            //when the trip is initialized
            scope.$watch('ngModel', function () {
                //TODO init must be called if the data is already loaded before the directive compilation
                init();
            });

            //To refresh the charts manually
            scope.$watch(function() { return angular.element(scope.element).is(':visible'); }, function() {
                angular.forEach( angular.element('.nvd3-chart > nvd3', scope.element),function(item){
                    var elem = angular.element(item);
                    $compile(elem)(scope);
                });
            });

			/**
			 * Initializes the catch panel directive
			 * 
			 * @memberof catchPanel
			 * @private
			 */
            var init = function() {
                scope.displayedUnit = locale.getString('activity.weight_unit_' + scope.unit);
                formattedChartData();
                initCharts();
            };
          
            /**
			 * To create data for catches per area.
			 * 
			 * @memberof catchPanel
			 * @private
			 */
            var catcheslist;
            function formattedChartData() {
                angular.forEach(scope.ngModel, function (chartData, currentChart) {
                    angular.forEach(chartData, function (chartDataValue, chartDataKey) {
                        angular.forEach(chartDataValue, function (areaInfoData, key) {
                            angular.forEach(areaInfoData, function (areaInfoValue, areaInfokey) {
                                if (areaInfokey === "areaInfo") {
                                    angular.forEach(areaInfoValue, function (propertyValue, propertyKey) {
                                        catcheslist = "<div class='tr' style='background-color:transparent;border-top:0'>" + "<div class='td'style='padding-top:0;padding-bottom:0;font-weight: normal'>" + propertyValue.areaName + "</div>" + "<div class='td' style='padding-top:0;padding-bottom:0; font-weight:normal'>" + propertyValue.weight + "kg" + "</div>" + "</div>";
                                    });
                                }
                                areaInfoData.catchPerArea = catcheslist;
                            });
                        });
                    });
                });
            }

        }
    };
});
