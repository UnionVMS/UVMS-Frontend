angular.module('unionvmsWeb').directive('catchPanel', function(loadingStatus,activityRestService,$anchorScroll,locale) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			trip: '=',
			tripAlert: '='
		},
		templateUrl: 'directive/activity/catchPanel/catchPanel.html',
		link: function(scope, element, attrs, fn) {

			loadingStatus.isLoading('TripSummary', true);
			activityRestService.getTripCatches(scope.trip.id).then(function(response){
				scope.trip.fromJson('catch',response.data);
				loadingStatus.isLoading('TripSummary', false);
			}, function(error){
				$anchorScroll();
				scope.tripAlert.hasAlert = true;
				scope.tripAlert.hasError = true;
				scope.tripAlert.alertMessage = locale.getString('activity.error_loading_trip_summary_catch_details');
				scope.tripAlert.hideAlert();
				loadingStatus.isLoading('TripSummary', false);
			});

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
		
			//to resize the chart after it's loaded
			scope.callback = function(scope, element){
				scope.api.refresh();
			};

		}
	};
});

/*angular.module('unionvmsWeb').controller('CatchpanelCtrl',function($scope,$element,loadingStatus,activityRestService,tripSummaryService,$anchorScroll,locale){
*/
    /* Chart options */
/*    $scope.options1 = {
        chart: {
            type: 'pieChart',
            height: 200,
            x: function(d){return d.speciesCode;},
            y: function(d){return d.weight;},
            valueFormat: function(d){
                var value = d/$scope.trip.catchDetails.onboard.total*100;
                return d + 'kg ('+ value.toFixed(2) + '%)';
            },
            showLabels: false,
            duration: 500,
            color: function (d, i) {
                return $scope.trip.catchDetails.onboard.speciesList[i].color;
            },
            showLegend: false
        }
    };

    $scope.options2 = {
        chart: {
            type: 'pieChart',
            height: 200,
            x: function(d){return d.speciesCode;},
            y: function(d){return d.weight;},
            valueFormat: function(d){
                var value = d/$scope.trip.catchDetails.landed.total*100;
                return d + 'kg ('+ value.toFixed(2) + '%)';
            },
            showLabels: false,
            duration: 500,
             color: function (d, i) {
                return $scope.trip.catchDetails.landed.speciesList[i].color;
            },
            showLegend: false
        }
    };

    loadingStatus.isLoading('TripSummary', true);
    activityRestService.getTripCatches($scope.trip.id).then(function(response){
        $scope.trip.fromJson('catch',response.data);
        loadingStatus.isLoading('TripSummary', false);
    }, function(error){
        $anchorScroll();
        $scope.alert.hasAlert = true;
        $scope.alert.hasError = true;
        $scope.alert.alertMessage = locale.getString('activity.error_loading_trip_summary_catch_details');
        $scope.alert.hideAlert();
        loadingStatus.isLoading('TripSummary', false);
    });
*/
    //to resize the chart after it's loaded
 /*   $scope.callback = function(scope, element){
        scope.api.refresh();
    };

    $scope.$watch('tab.active',function(newVal,oldVal){
        if(newVal){
            $scope.api.refresh();
        }
    });

    $scope.isTabActive = function(){
        if($.contains(angular.element('.tab-pane.active')[0],$element["0"].parentElement)){
            return true;
        }else{
            return false;
        }
    };

});*/