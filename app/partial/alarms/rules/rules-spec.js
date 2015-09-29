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

	it('should be possible to delete or edit rules that the current user has created', inject(function(Rule) {

        var rule = new Rule();
        rule.createdBy = testUser;
		expect(scope.allowedToDeleteOrUpdateRule(rule)).toBeTruthy();

	}));

    it('should not be possible to delete or edit rules that another user has created', inject(function(Rule) {

        var rule = new Rule();
        rule.createdBy = otherUser;
        expect(scope.allowedToDeleteOrUpdateRule(rule)).toBeFalsy();

    }));

});