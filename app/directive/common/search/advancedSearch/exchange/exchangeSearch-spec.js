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

    it('should remove DATE_RECEIVED_FROM and DATE_RECEIVED_TO when EXCHANGE_TIME_SPAN changes to something other than CUSTOM', inject(function($q, ruleRestService) {
        var deferred = $q.defer();
        spyOn(ruleRestService, "getRulesList").andReturn(deferred.promise);
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

    it('should not remove DATE_RECEIVED_FROM and DATE_RECEIVED_TO when EXCHANGE_TIME_SPAN changes to CUSTOM', inject(function($q, ruleRestService) {
        var deferred = $q.defer();
        spyOn(ruleRestService, "getRulesList").andReturn(deferred.promise);
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

    it('should change EXCHANGE_TIME_SPAN to CUSTOM when DATE_RECEIVED_FROM or DATE_RECEIVED_TO changes', inject(function($q, ruleRestService) {
        var deferred = $q.defer();
        spyOn(ruleRestService, "getRulesList").andReturn(deferred.promise);
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