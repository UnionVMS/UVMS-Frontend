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
describe('HeaderMenuCtrl', function() {

    var scope, ctrl, state, rootScope;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $controller, $state, $httpBackend) {
        scope = $rootScope.$new();
        ctrl = $controller('HeaderMenuCtrl', {$scope:scope});
        state = $state;
        rootScope = $rootScope;

        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should set naviugation tab to active', inject(function($controller) {
        var ctrl = $controller('HeaderMenuCtrl', {
            $scope: scope,
            $location: {
                path: function() {
                    return "/uvms";
                }
            }
        });

        expect(scope.isActive("/uvms")).toBeTruthy();
        expect(scope.isActive("/uvms/apa")).toBeTruthy();

        expect(scope.isActive("uvms/apa")).toBeFalsy();
        expect(scope.isActive("")).toBeFalsy();
        expect(scope.isActive("/")).toBeFalsy();
        expect(scope.isActive("/uvms2")).toBeFalsy();
    }));

//    it('should always display the "today" navigation tab, regardless of other access', inject(function(userService) {
//        var userAllowedSpy = spyOn(userService, "isAllowed").andReturn(false);
//        scope.setMenu();
//
//        expect(userAllowedSpy).toHaveBeenCalled();
//        expect(scope.menu.length).toBe(1);
//        expect(scope.menu[0].url).toBe('/today');
//        expect(scope.menu[0].elemId).toBe('today');
//    }));

    it('should display more navigation tabs than "today" if the user has access', inject(function(userService) {
        var userAllowedSpy = spyOn(userService, "isAllowed").andReturn(true);
        scope.setMenu();
        expect(userAllowedSpy).toHaveBeenCalled();
        expect(scope.menu.length).toBeGreaterThan(1);
    }));

    it('should set menu if authentication success', function() {
        var setMenuSpy = spyOn(scope, 'setMenu');
        expect(setMenuSpy).not.toHaveBeenCalled();

        //Broadcast event
        rootScope.$broadcast("AuthenticationSuccess");
        rootScope.$digest();

        expect(setMenuSpy).toHaveBeenCalled();
    });

    it('should set menu if authentication needed', function() {
        var setMenuSpy = spyOn(scope, 'setMenu');
        expect(setMenuSpy).not.toHaveBeenCalled();

        //Broadcast event
        rootScope.$broadcast("needsAuthentication");
        rootScope.$digest();

        expect(setMenuSpy).toHaveBeenCalled();
    });
});
