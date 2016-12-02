/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name catchPanel
 * @attr {unionvmsWeb.Trip} ngModel - current trip in trip summary
 * @attr {Object} tripAlert - trip summary alert state
 * @description
 *  A reusable tile that will display the catch details(overview) related to the current trip
 */
angular.module('unionvmsWeb').directive('catchPanel', function (loadingStatus, activityRestService, $anchorScroll, locale, tripSummaryService, reportingNavigatorService) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=',
            tripAlert: '=',
            fieldData: '='
        },
        templateUrl: 'directive/activity/catchPanel/catchPanel.html',
        link: function (scope, element, attrs, fn) {
            scope.repNav = reportingNavigatorService;
            scope.tripSummServ = tripSummaryService;

			/**
			 * Initialize the charts with nvd3 properties
			 * 
			 * @memberof catchPanel
			 * @private
			 */

            var initCharts = function () {
                scope.options = {};
                angular.forEach(scope.ngModel, function (chartData, currentChart) {

                    var chartOptions = {
                        chart: {
                            type: 'pieChart',
                            height: 200,
                            x: function (d) { return d.speciesCode; },
                            y: function (d) { return d.weight; },
                            valueFormat: function (d) {
                                return scope.formatWeight(d, chartData.total, 'KG');
                            },
                            showLabels: false,
                            duration: 500,
                            color: function (d, i) {
                                return chartData.speciesList[i].color;
                            },
                            showLegend: false
                        }
                    };
                    scope.options[currentChart] = chartOptions;

                });
            };

			/**
			 * function to calculate species Weight Percentage
			 * 
			 * @memberof catchPanel
			 * @public
			 * @param {Object} specieWeight - individual specie weight.
			 * @param {Object} weightType - unit of the weight.
			 * @param {Object} totalWeight - total weight of the specie.
			 */
            scope.formatWeight = function (specieWeight, totalWeight, weightType) {
                console.log("hello");
                var value = specieWeight / totalWeight * 100;
                return specieWeight + weightType + '(' + value.toFixed(2) + '%)';
            };

			/**
			 * Callback function to refresh the charts after their loading
			 * 
			 * @memberof catchPanel
			 * @public
			 * @param {Object} scope - nvd3 directive scope
			 * @param {Object} element - chart element
			 */
            scope.callback = function (scope, element) {
                //to resize the chart after it's loaded
                scope.api.refresh();
            };

            //when tthe trip is initialized
            scope.$watch('ngModel', function () {
                init();

            });

			/**
			 * Initializes the catch panel directive
			 * 
			 * @memberof catchPanel
			 * @private
			 */
            var init = function () {
                loadingStatus.isLoading(scope.fieldData.loadingScreen, true);
                scope.loadingCharts = true;
                initCharts();
                loadingStatus.isLoading(scope.fieldData.loadingScreen, false);

            };

        }
    };
});
