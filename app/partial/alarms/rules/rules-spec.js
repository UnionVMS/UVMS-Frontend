describe('RulesCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl;
    var testUser = 'TestUser',
        otherUser = 'OtherUser';

    beforeEach(inject(function($rootScope, $controller, userService) {
      scope = $rootScope.$new();
      ctrl = $controller('RulesCtrl', {$scope: scope});
      spyOn(userService, "getUserName").andReturn(testUser);
    }));

	it('should be possible to delete or edit Event rules if user has access to feature manageAlarmsRules', inject(function(Rule, userService) {

        spyOn(userService, "isAllowed").andCallFake(function(feature, module, allContexts){
            if(feature === 'manageAlarmsRules'){
                return true;
            }
            return false;
        });

        var rule = new Rule();
        rule.type = 'EVENT';
        rule.createdBy = testUser;
		expect(scope.allowedToDeleteOrUpdateRule(rule)).toBeTruthy();
        expect(userService.isAllowed.mostRecentCall.args[0]).toEqual('manageAlarmsRules');
        expect(userService.isAllowed.mostRecentCall.args[1]).toEqual('Rules');

	}));

    it('should NOT be possible to delete or edit Event rules if user has access to feature manageAlarmsRules', inject(function(Rule, userService) {

        spyOn(userService, "isAllowed").andCallFake(function(feature, module, allContexts){
            if(feature === 'manageAlarmsRules'){
                return false;
            }
            return true;
        });

        var rule = new Rule();
        rule.type = 'EVENT';
        rule.createdBy = testUser;
        expect(scope.allowedToDeleteOrUpdateRule(rule)).toBeFalsy();
        expect(userService.isAllowed.mostRecentCall.args[0]).toEqual('manageAlarmsRules');
        expect(userService.isAllowed.mostRecentCall.args[1]).toEqual('Rules');

    }));

    it('should be possible to delete or edit Global rules if user has access to feature manageGlobalAlarmsRules', inject(function(Rule, userService) {

        spyOn(userService, "isAllowed").andCallFake(function(feature, module, allContexts){
            if(feature === 'manageGlobalAlarmsRules'){
                return true;
            }
            return false;
        });

        var rule = new Rule();
        rule.type = 'GLOBAL';
        rule.createdBy = testUser;
        expect(scope.allowedToDeleteOrUpdateRule(rule)).toBeTruthy();
        expect(userService.isAllowed.mostRecentCall.args[0]).toEqual('manageGlobalAlarmsRules');
        expect(userService.isAllowed.mostRecentCall.args[1]).toEqual('Rules');

    }));

    it('should NOT be possible to delete or edit Global rules if user has no access to feature manageGlobalAlarmsRules', inject(function(Rule, userService) {

        spyOn(userService, "isAllowed").andCallFake(function(feature, module, allContexts){
            if(feature === 'manageGlobalAlarmsRules'){
                return false;
            }
            return true;
        });

        var rule = new Rule();
        rule.type = 'GLOBAL';
        rule.createdBy = testUser;
        expect(scope.allowedToDeleteOrUpdateRule(rule)).toBeFalsy();
        expect(userService.isAllowed.mostRecentCall.args[0]).toEqual('manageGlobalAlarmsRules');
        expect(userService.isAllowed.mostRecentCall.args[1]).toEqual('Rules');

    }));


    it("isSubscriptionPossible should return correctly", inject(function(Rule) {
        var rule = new Rule();

        //Subscription is only possible when type is other than 'GLOBAL'
        rule.type = 'GLOBAL';
        expect(scope.isSubscriptionPossible(rule)).toBeFalsy();

        rule.type = 'EVENT';
        expect(scope.isSubscriptionPossible(rule)).toBeTruthy();
    }));
});