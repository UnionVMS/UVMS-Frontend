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
angular.module('unionvmsWeb').controller('ExchangeSearchController', function($scope, searchService, locale, configurationService) {

	var init = function(){
	    $scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_TODAY;
        $scope.resetSearch();
        //FIXME the following should be uncommented when exchange config rest service is updated
        //Do not forget to check config.lang.json
//        $scope.recipientItems = configurationService.setTextAndCodeForDropDown(configurationService.getValue('EXCHANGE', 'RECIPIENT'), 'RECIPIENT', 'EXCHANGE', true);
//        $scope.statusItems = configurationService.setTextAndCodeForDropDown(configurationService.getValue('EXCHANGE', 'STATUS'), 'STATUS', 'EXCHANGE', true);
        
        //FIXME to remove all items mocked here
        $scope.recipientItems = [{
            code: 'DNK', text: 'DNK'
        },{
            code: 'FIN', text: 'FIN'
        }];
        
        $scope.statusItems = [{
            code: 'EXCHANGE_STATUS_ISSUED', text: 'Issued'
        },{
            code: 'EXCHANGE_STATUS_PENDING', text: 'Pending'
        },{
            code: 'EXCHANGE_STATUS_PROBABLY_TRANSMITTED', text: 'Probably transmitted'
        },{
            code: 'EXCHANGE_STATUS_FAILED', text: 'Failed'
        },{
            code: 'EXCHANGE_STATUS_SUCCESSFUL', text: 'Successful'
        },{
            code: 'EXCHANGE_STATUS_SUCCESSFUL_WITH_WARNINGS', text: 'Successful with warnings'
        },{
            code: 'EXCHANGE_STATUS_UNKNOWN', text: 'Unknown'
        },{
            code: 'EXCHANGE_STATUS_OK', text: 'OK'
        },{
            code: 'EXCHANGE_STATUS_WARN', text: 'Warnings'
        },{
            code: 'EXCHANGE_STATUS_ERROR', text: 'Error'
        },{
            code: 'EXCHANGE_STATUS_SENT', text: 'Sent'
        }];
        
        $scope.sourceItems = [{
            code: 'Inmarsat-C', text: 'Inmarsat-C'
        },{
            code: 'FLUX', text: 'FLUX'    
        }];
        
        $scope.typeItems = [{
            code: 'MOVEMENT', text: 'Movement'
        },{
            code: 'POLL', text: 'Poll'
        },{
            code: 'ALARM', text: 'Alarm'
        },{
            code: 'UNKNOWN', text: 'Unknown'
        },{
            code: 'SALES_QUERY', text: 'Sales query'
        },{
            code: 'SALES_REPORT', text: 'Sales report'
        },{
            code: 'SALES_RESPONSE', text: 'Sales response'
        },{
            code: 'FA_QUERY', text: 'FA query'
        },{
            code: 'FA_REPORT', text: 'FA report'
        },{
            code: 'FA_RESPONSE', text: 'FA response'
        }];
    };

    $scope.$on("resetExchangeLogSearch", function() {
    	$scope.resetSearch();
    });

    //Reset the form
    $scope.resetSearch = function(){
        //empty advancedSearchobject.
        $scope.resetAdvancedSearchForm(false);
        $scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_TODAY;
        $scope.performAdvancedSearch();
    };

	$scope.$watch("advancedSearchObject.DATE_RECEIVED_FROM", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_CUSTOM;
		}
	});

	$scope.$watch("advancedSearchObject.DATE_RECEIVED_TO", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.EXCHANGE_TIME_SPAN = $scope.DATE_CUSTOM;
		}
	});

	$scope.$watch('advancedSearchObject.EXCHANGE_TIME_SPAN', function(newValue) {
		if (newValue && newValue !== $scope.DATE_CUSTOM) {
			delete $scope.advancedSearchObject.DATE_RECEIVED_FROM;
			delete $scope.advancedSearchObject.DATE_RECEIVED_TO;
		}
	});

    init();
});