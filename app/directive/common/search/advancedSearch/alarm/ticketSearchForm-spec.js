describe('TicketSearchController', function() {

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
            scope.timeSpanOptions = [];
            return $controller('TicketSearchController', {$scope: scope});
        };
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should listen for resetAlarmSearch event and reset search form when it happens', inject(function($q, ruleRestService) {
        var deferred = $q.defer();
        spyOn(ruleRestService, "getRulesList").andReturn(deferred.promise);
        var controller = createController();

        var resetSpySearch = spyOn(scope, 'resetSearch');
        expect(resetSpySearch).not.toHaveBeenCalled();

        //Broadcast event
        scope.$broadcast("resetAlarmSearch");
        scope.$digest();

        expect(resetSpySearch).toHaveBeenCalled();

    }));

    it('should get list of rules on init and updated ruleOptions with the reponse', inject(function($q, ruleRestService, SearchResultListPage, Rule) {
        //Mock response from gerRulesList
        var deferred = $q.defer();
        var rule1 = new Rule();
        var rule2 = new Rule();
        var items = [rule1, rule2];
        var rulesPage = new SearchResultListPage(items, 1, 1);
        deferred.resolve(rulesPage);
        var getRulesSpy = spyOn(ruleRestService, "getRulesList").andReturn(deferred.promise);

        var controller = createController();

        scope.$digest();

        expect(getRulesSpy).toHaveBeenCalled();
        expect(scope.rules.length).toEqual(2);

    }));

    it('should remove FROM_DATE and TO_DATE when TIME_SPAN changes to something other than CUSTOM', inject(function($q, ruleRestService) {
        var deferred = $q.defer();
        spyOn(ruleRestService, "getRulesList").andReturn(deferred.promise);
        var controller = createController();
        scope.$digest();

        scope.advancedSearchObject.FROM_DATE = 'A';
        scope.advancedSearchObject.TO_DATE = 'B';
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change TIME_SPAN to something other than CUSTOM should remove FROM_DATE and TO_DATE from advancedSearchObject
        scope.advancedSearchObject.TIME_SPAN = 'UPDATED_VALUE';
        scope.$digest();

        expect('FROM_DATE' in scope.advancedSearchObject).toBeFalsy()
        expect('TO_DATE' in scope.advancedSearchObject).toBeFalsy()
    }));

    it('should not remove FROM_DATE and TO_DATE when TIME_SPAN changes to CUSTOM', inject(function($q, ruleRestService) {
        var deferred = $q.defer();
        spyOn(ruleRestService, "getRulesList").andReturn(deferred.promise);
        var controller = createController();
        scope.$digest();

        scope.advancedSearchObject.FROM_DATE = 'A';
        scope.advancedSearchObject.TO_DATE = 'B';
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change TIME_SPAN to CUSTOM, should keep FROM_DATE and TO_DATE
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_CUSTOM;
        scope.$digest();

        expect('FROM_DATE' in scope.advancedSearchObject).toBeTruthy()
        expect('TO_DATE' in scope.advancedSearchObject).toBeTruthy()
    }));

    it('should change TIME_SPAN to CUSTOM when FROM_DATE or TO_DATE changes', inject(function($q, ruleRestService) {
        var deferred = $q.defer();
        spyOn(ruleRestService, "getRulesList").andReturn(deferred.promise);
        var controller = createController();
        scope.$digest();

        scope.advancedSearchObject.FROM_DATE = 'A';
        scope.advancedSearchObject.TO_DATE = 'B';
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change TIME_SPAN to TODAY
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change FROM_DATE
        expect(scope.advancedSearchObject.TIME_SPAN).toEqual(scope.DATE_TODAY);
        scope.advancedSearchObject.FROM_DATE = 'UPDATED_VALUE';
        scope.$digest();
        expect(scope.advancedSearchObject.TIME_SPAN).toEqual(scope.DATE_CUSTOM);

        //Change TIME_SPAN to TODAY
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change TO_DATE
        expect(scope.advancedSearchObject.TIME_SPAN).toEqual(scope.DATE_TODAY);
        scope.advancedSearchObject.TO_DATE = 'UPDATED_VALUE';
        scope.$digest();
        expect(scope.advancedSearchObject.TIME_SPAN).toEqual(scope.DATE_CUSTOM);
    }));

});