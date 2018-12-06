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
angular.module('unionvmsWeb').controller('ExchangeSearchController', function($scope, searchService, locale, configurationService,globalSettingsService) {

	var init = function(){
	    $scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_TODAY;
        $scope.resetSearch();

        $scope.recipientItems = configurationService.setTextAndCodeForDropDown(configurationService.getValue('EXCHANGE', 'RECIPIENT'), 'RECIPIENT', 'EXCHANGE', true);
        $scope.statusItems = configurationService.setTextAndCodeForDropDown(configurationService.getValue('EXCHANGE', 'STATUS'), 'STATUS', 'EXCHANGE', true);
        $scope.sourceItems = configurationService.setTextAndCodeForDropDown(configurationService.getValue('EXCHANGE', 'SOURCE'), 'SOURCE', 'EXCHANGE', true);
        $scope.typeItems = configurationService.setTextAndCodeForDropDown(configurationService.getValue('EXCHANGE', 'TYPE'), 'TYPE', 'EXCHANGE', true);

        $scope.timeSpanOptions.push({text: locale.getString('common.time_span_custom_hours'), code:'CUSTOM_HOURS'});
    };

    $scope.$on("resetExchangeLogSearch", function() {
    	$scope.resetSearch();
    });

    //Reset the form
    $scope.resetSearch = function(){
        //empty advancedSearchobject.
        $scope.resetAdvancedSearchForm(false);
        $scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_TODAY;
        delete $scope.advancedSearchObject.hours;
        $scope.performAdvancedSearch();
    };

	$scope.$watch("advancedSearchObject.DATE_RECEIVED_FROM", function(newValue) {
		if (newValue && $scope.advancedSearchObject.EXCHANGE_TIME_SPAN !== 'CUSTOM_HOURS') {
			$scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_CUSTOM;
		}
	});

	$scope.$watch("advancedSearchObject.DATE_RECEIVED_TO", function(newValue) {
		if (newValue && $scope.advancedSearchObject.EXCHANGE_TIME_SPAN !== 'CUSTOM_HOURS') {
			$scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_CUSTOM;
		}
	});

	$scope.$watch('advancedSearchObject.EXCHANGE_TIME_SPAN', function(newValue) {
	    if (newValue){
            if (newValue === 'CUSTOM_HOURS') {
                $scope.advancedSearchObject.hours = 1;
            } else if (newValue === $scope.DATE_CUSTOM){
                $scope.advancedSearchObject.DATE_RECEIVED_FROM = undefined;
                $scope.advancedSearchObject.DATE_RECEIVED_TO = undefined;
            } else {
                delete $scope.advancedSearchObject.DATE_RECEIVED_FROM;
                delete $scope.advancedSearchObject.DATE_RECEIVED_TO;
                delete $scope.advancedSearchObject.hours;
            }
        }
	});

	function calculateTimeSpanForHours(value){
        var dateFormat = 'YYYY-MM-DD HH:mm:ss +00:00';
        var now = moment();
        var before = now.clone();
        before.subtract(value, 'hours');

        $scope.advancedSearchObject.DATE_RECEIVED_FROM = moment.utc(before).format(dateFormat);
        $scope.advancedSearchObject.DATE_RECEIVED_TO = moment.utc(now).format(dateFormat);
    }

	$scope.$watch('advancedSearchObject.hours', function(newValue){
	    if ($scope.advancedSearchObject.EXCHANGE_TIME_SPAN === 'CUSTOM_HOURS'){
            if (angular.isUndefined(newValue)){
                $scope.advancedSearchObject.hours = 1;
            }

            calculateTimeSpanForHours(newValue);
        }
    });

    init();
});
