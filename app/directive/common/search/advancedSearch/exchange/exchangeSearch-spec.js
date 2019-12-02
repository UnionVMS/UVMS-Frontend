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
describe('ExchangeSearchController', function() {

    var scope, createController;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        createController = function(){
            //Mock functions (exists in parent scope)
            scope.resetAdvancedSearchForm = function(){};
            scope.performAdvancedSearch = function(){};
            scope.advancedSearchObject = {};
            scope.DATE_CUSTOM = 'CUSTOM';
            scope.DATE_TODAY = 'TODAY';
            return $controller('ExchangeSearchController', {$scope: scope});
        };
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should listen for resetExchangeLogSearch event and reset search form when it happens', inject(function($q) {
        var deferred = $q.defer();
        var controller = createController();

        var resetSpySearch = spyOn(scope, 'resetSearch');
        expect(resetSpySearch).not.toHaveBeenCalled();

        //Broadcast event
        scope.$broadcast("resetExchangeLogSearch");
        scope.$digest();

        expect(resetSpySearch).toHaveBeenCalled();

    }));

    it('should remove DATE_RECEIVED_FROM and DATE_RECEIVED_TO when EXCHANGE_TIME_SPAN changes to something other than CUSTOM', inject(function($q) {
        var deferred = $q.defer();
        var controller = createController();
        scope.$digest();

        scope.advancedSearchObject.DATE_RECEIVED_FROM = 'A';
        scope.advancedSearchObject.DATE_RECEIVED_TO = 'B';
        scope.advancedSearchObject.EXCHANGE_TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change EXCHANGE_TIME_SPAN to something other than CUSTOM should remove DATE_RECEIVED_FROM and DATE_RECEIVED_TO from advancedSearchObject
        scope.advancedSearchObject.EXCHANGE_TIME_SPAN = 'UPDATED_VALUE';
        scope.$digest();

        expect('DATE_RECEIVED_FROM' in scope.advancedSearchObject).toBeFalsy()
        expect('DATE_RECEIVED_TO' in scope.advancedSearchObject).toBeFalsy()
    }));

    it('should not remove DATE_RECEIVED_FROM and DATE_RECEIVED_TO when EXCHANGE_TIME_SPAN changes to CUSTOM', inject(function($q) {
        var deferred = $q.defer();
        var controller = createController();
        scope.$digest();

        scope.advancedSearchObject.DATE_RECEIVED_FROM = 'A';
        scope.advancedSearchObject.DATE_RECEIVED_TO = 'B';
        scope.advancedSearchObject.EXCHANGE_TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change EXCHANGE_TIME_SPAN to CUSTOM, should keep DATE_RECEIVED_FROM and DATE_RECEIVED_TO
        scope.advancedSearchObject.EXCHANGE_TIME_SPAN = scope.DATE_CUSTOM;
        scope.$digest();

        expect('DATE_RECEIVED_FROM' in scope.advancedSearchObject).toBeTruthy()
        expect('DATE_RECEIVED_TO' in scope.advancedSearchObject).toBeTruthy()
    }));

    it('should change EXCHANGE_TIME_SPAN to CUSTOM when DATE_RECEIVED_FROM or DATE_RECEIVED_TO changes', inject(function($q) {
        var deferred = $q.defer();
        var controller = createController();
        scope.$digest();

        scope.advancedSearchObject.DATE_RECEIVED_FROM = 'A';
        scope.advancedSearchObject.DATE_RECEIVED_TO = 'B';
        scope.advancedSearchObject.EXCHANGE_TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change EXCHANGE_TIME_SPAN to TODAY
        scope.advancedSearchObject.EXCHANGE_TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change DATE_RECEIVED_FROM
        expect(scope.advancedSearchObject.EXCHANGE_TIME_SPAN).toEqual(scope.DATE_TODAY);
        scope.advancedSearchObject.DATE_RECEIVED_FROM = 'UPDATED_VALUE';
        scope.$digest();
        expect(scope.advancedSearchObject.EXCHANGE_TIME_SPAN).toEqual(scope.DATE_CUSTOM);

        //Change EXCHANGE_TIME_SPAN to TODAY
        scope.advancedSearchObject.EXCHANGE_TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change DATE_RECEIVED_TO
        expect(scope.advancedSearchObject.EXCHANGE_TIME_SPAN).toEqual(scope.DATE_TODAY);
        scope.advancedSearchObject.DATE_RECEIVED_TO = 'UPDATED_VALUE';
        scope.$digest();
        expect(scope.advancedSearchObject.EXCHANGE_TIME_SPAN).toEqual(scope.DATE_CUSTOM);
    }));

});