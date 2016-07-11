/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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

	it('should be possible to delete or edit Public rules if user has access to feature manageAlarmRules', inject(function(Rule, userService) {

        spyOn(userService, "isAllowed").andCallFake(function(feature, module, allContexts){
            if(feature === 'manageAlarmRules'){
                return true;
            }
            return false;
        });

        var rule = new Rule();
        rule.availability = 'PUBLIC';
        rule.createdBy = testUser;
		expect(scope.allowedToDeleteOrUpdateRule(rule)).toBeTruthy();
        expect(userService.isAllowed.mostRecentCall.args[0]).toEqual('manageAlarmRules');
        expect(userService.isAllowed.mostRecentCall.args[1]).toEqual('Rules');

	}));

    it('should NOT be possible to delete or edit Public rules if user has access to feature manageAlarmRules', inject(function(Rule, userService) {

        spyOn(userService, "isAllowed").andCallFake(function(feature, module, allContexts){
            if(feature === 'manageAlarmRules'){
                return false;
            }
            return true;
        });

        var rule = new Rule();
        rule.availability = 'PUBLIC';
        rule.createdBy = testUser;
        expect(scope.allowedToDeleteOrUpdateRule(rule)).toBeFalsy();
        expect(userService.isAllowed.mostRecentCall.args[0]).toEqual('manageAlarmRules');
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
        rule.availability = 'GLOBAL';
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
        rule.availability = 'GLOBAL';
        rule.createdBy = testUser;
        expect(scope.allowedToDeleteOrUpdateRule(rule)).toBeFalsy();
        expect(userService.isAllowed.mostRecentCall.args[0]).toEqual('manageGlobalAlarmsRules');
        expect(userService.isAllowed.mostRecentCall.args[1]).toEqual('Rules');

    }));

});