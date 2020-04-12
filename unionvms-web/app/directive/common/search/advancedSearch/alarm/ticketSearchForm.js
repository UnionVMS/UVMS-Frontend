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
angular.module('unionvmsWeb').controller('TicketSearchController', function($scope, locale, ruleRestService, configurationService, userService) {

    $scope.rules = [];

    var init = function(){
        //Add ALL option to timeSpan dropdown
        $scope.timeSpanOptions.unshift({text: locale.getString('common.time_span_all'), code:'ALL'});

        //Populate rules dropdown
        ruleRestService.getAllRulesForUser().then(function(rulesPage){
            var rulesOptions = [];
            $.each(rulesPage.items, function(i, rule){
                rulesOptions.push({text: rule.name, code: rule.guid});
            });
            rulesOptions = _.sortBy(rulesOptions, function(obj){return obj.text;});
            $scope.rules = rulesOptions;
        });

        //Status options
        $scope.statusOptions = configurationService.setTextAndCodeForDropDown(configurationService.getConfig('TICKET_STATUSES'), 'STATUS', 'TICKET', true);

        $scope.resetSearch();
    };

    $scope.$on("resetAlarmSearch", function() {
        $scope.resetSearch();
    });

    //Reset the form
    $scope.resetSearch = function(){
        //empty advancedSearchobject.
        $scope.resetAdvancedSearchForm(false);
        //Set TIME_SPAN to ALL
        $scope.advancedSearchObject.TIME_SPAN = 'ALL';
        //Set status to OPEN
        var statuses = configurationService.getConfig('TICKET_STATUSES');
        if(Array.isArray(statuses) && statuses.indexOf('OPEN') >= 0){
            $scope.advancedSearchObject.STATUS = 'OPEN';
        }
        $scope.performAdvancedSearch();
    };

	$scope.$watch("advancedSearchObject.FROM_DATE", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.TIME_SPAN = $scope.DATE_CUSTOM;
		}
	});

	$scope.$watch("advancedSearchObject.TO_DATE", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.TIME_SPAN = $scope.DATE_CUSTOM;
		}
	});

	$scope.$watch('advancedSearchObject.TIME_SPAN', function(newValue) {
		if (newValue && newValue !== $scope.DATE_CUSTOM) {
			delete $scope.advancedSearchObject.FROM_DATE;
			delete $scope.advancedSearchObject.TO_DATE;
		}
	});

    init();
});