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
describe('showIfAllowed', function() {

    beforeEach(module('unionvmsWeb'));

    var scope,compile;

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function(_$compile_, _$rootScope_, $httpBackend){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;

        //Mock translation files for usm
        $httpBackend.whenGET(/^usm\//).respond({});
    }));

    it('should not remove the element if the user is allowed to the feature', function() {

        inject(function(userService){
            //Access granted
            spyOn(userService, "isAllowed").andReturn(true);       
        });

        //Create element using the directive
        var element = $compile("<div><span show-if-allowed='viewTest'>Test</span></div>")($rootScope);

        // Check that the compiled element has not been removed and still contains the string Test
        expect(element.html()).toContain('Test');
    });

    it('should remove the element if the user is not allowed to the feature', function() {

        inject(function(userService){
            //Access denied
            spyOn(userService, "isAllowed").andReturn(false);      
        });

        //Create element using the directive
        var element = $compile("<div><span show-if-allowed='viewTest'>Test</span></div>")($rootScope);

        // Check that the compiled element has been removed
        expect(element.html()).not.toContain('Test');
    });

});