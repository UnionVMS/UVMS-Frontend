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
angular.module('unionvmsWeb').directive('catchPanel', function(locale) {
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

			/**
			 * Initialize the charts with nvd3 properties
			 * 
			 * @memberof catchPanel
			 * @private
			 */
            var initCharts = function() {
                scope.options = {};
                angular.forEach(scope.ngModel, function(chartData, currentChart){
                    var chartOptions = {
                        chart: {
                            type: 'pieChart',
                            height: scope.height,
                            x: function(d) { return d.speciesCode; },
                            y: function(d) { return d.weight; },
                            valueFormat: function(d) {
                                return scope.formatWeight(d, chartData.total, scope.displayedUnit);
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
            scope.formatWeight = function(specieWeight, totalWeight, weightUnit) {
                var value = specieWeight / totalWeight * 100;
                return specieWeight + weightUnit + ' (' + value.toFixed(2) + '%)';
            };

            //when the trip is initialized
            scope.$watch('ngModel', function() {
                init();
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
