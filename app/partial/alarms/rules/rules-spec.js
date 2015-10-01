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

	it('should be possible to delete or edit Event rules that the current user has created', inject(function(Rule) {

        var rule = new Rule();
        rule.type = 'EVENT';
        rule.createdBy = testUser;
		expect(scope.allowedToDeleteOrUpdateRule(rule)).toBeTruthy();

	}));

    it('should NOT be possible to delete or edit Event rules that another user has created', inject(function(Rule) {

        var rule = new Rule();
        rule.type = 'EVENT';
        rule.createdBy = otherUser;
        expect(scope.allowedToDeleteOrUpdateRule(rule)).toBeFalsy();

    }));

    it('should be possible to delete or edit Global rules if user has access to feature manageGlobalAlarmsRules', inject(function(Rule, userService) {

        spyOn(userService, "isAllowed").andReturn(true);

        var rule = new Rule();
        rule.type = 'GLOBAL';
        rule.createdBy = testUser;
        expect(scope.allowedToDeleteOrUpdateRule(rule)).toBeTruthy();
        expect(userService.isAllowed.mostRecentCall.args[0]).toEqual('manageGlobalAlarmsRules');
        expect(userService.isAllowed.mostRecentCall.args[1]).toEqual('Alarms');

    }));

    it('should NOT be possible to delete or edit Global rules if user has access to feature manageGlobalAlarmsRules', inject(function(Rule, userService) {

        spyOn(userService, "isAllowed").andReturn(false);

        var rule = new Rule();
        rule.type = 'GLOBAL';
        rule.createdBy = testUser;
        expect(scope.allowedToDeleteOrUpdateRule(rule)).toBeFalsy();
        expect(userService.isAllowed.mostRecentCall.args[0]).toEqual('manageGlobalAlarmsRules');
        expect(userService.isAllowed.mostRecentCall.args[1]).toEqual('Alarms');

    }));
});