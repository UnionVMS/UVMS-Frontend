/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name catchPanel
 * @attr {unionvmsWeb.Trip} trip - current trip in trip summary
 * @attr {Object} tripAlert - trip summary alert state
 * @description
 *  A reusable tile that will display the catch details(overview) related to the current trip
 */
angular.module('unionvmsWeb').directive('catchPanel', function(loadingStatus,activityRestService,$anchorScroll,locale,tripSummaryService) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			trip: '=',
			tripAlert: '='
		},
		templateUrl: 'directive/activity/catchPanel/catchPanel.html',
		link: function(scope, element, attrs, fn) {

			scope.tripSummServ = tripSummaryService;

			/**
			 * Initialize the charts with nvd3 properties
			 * 
			 * @memberof catchPanel
			 * @private
			 */
			var initCharts = function(){
				scope.options1 = {
					chart: {
						type: 'pieChart',
						height: 200,
						x: function(d){return d.speciesCode;},
						y: function(d){return d.weight;},
						valueFormat: function(d){
							var value = d/scope.trip.catchDetails.onboard.total*100;
							return d + 'kg ('+ value.toFixed(2) + '%)';
						},
						showLabels: false,
						duration: 500,
						color: function (d, i) {
							return scope.trip.catchDetails.onboard.speciesList[i].color;
						},
						showLegend: false
					}
				};

				scope.options2 = {
					chart: {
						type: 'pieChart',
						height: 200,
						x: function(d){return d.speciesCode;},
						y: function(d){return d.weight;},
						valueFormat: function(d){
							var value = d/scope.trip.catchDetails.landed.total*100;
							return d + 'kg ('+ value.toFixed(2) + '%)';
						},
						showLabels: false,
						duration: 500,
						color: function (d, i) {
							return scope.trip.catchDetails.landed.speciesList[i].color;
						},
						showLegend: false
					}
				};
			};

			/**
			 * Callback function to refresh the charts after their loading
			 * 
			 * @memberof catchPanel
			 * @public
			 * @param {Object} scope - nvd3 directive scope
			 * @param {Object} element - chart element
			 */
			scope.callback = function(scope, element){
				//to resize the chart after it's loaded
				scope.api.refresh();
			};

			scope.$watch('trip',function(){
				init();
			});

			/**
			 * Initializes the catch panel directive
			 * 
			 * @memberof catchPanel
			 * @private
			 */
			var init = function(){
				//get trip catch details
				loadingStatus.isLoading('TripSummary', true);
				scope.loadingCharts = true;
				activityRestService.getTripCatches(scope.trip.id).then(function(response){
					scope.trip.fromJson('catch',response.data);
					initCharts();
					scope.loadingCharts = false;
					loadingStatus.isLoading('TripSummary', false);
				}, function(error){
					scope.loadingCharts = false;
					$anchorScroll();
					scope.tripAlert.hasAlert = true;
					scope.tripAlert.hasError = true;
					scope.tripAlert.alertMessage = locale.getString('activity.error_loading_trip_summary_catch_details');
					scope.tripAlert.hideAlert();
					loadingStatus.isLoading('TripSummary', false);
				});
			};

		}
	};
});
