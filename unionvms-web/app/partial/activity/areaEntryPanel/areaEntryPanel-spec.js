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
describe('AreaentrypanelCtrl', function() {

    beforeEach(module('unionvmsWeb'));

    var scope,ctrl,fishActRestServSpy;
    
    beforeEach(function(){
        fishActRestServSpy = jasmine.createSpyObj('fishingActivityService', ['getFishingActivity', 'reloadFromActivityHistory']);
        
        module(function($provide){
            $provide.value('fishingActivityService', fishActRestServSpy);
        });
    });

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    

    function getFishingActivity(){
        return {code: 200};
    }

    function buildMocks() {
        fishActRestServSpy.getFishingActivity.andCallFake(function(){
            return {
                then: function(callback){
                        return callback(getFishingActivity());
                }
            };
        });
    }
    
    describe('Standard loading of the area entry', function(){
        beforeEach(inject(function($rootScope, $controller) {
            buildMocks();
            fishActRestServSpy.reloadFromActivityHistory = false;
            scope = $rootScope.$new();
            ctrl = $controller('AreaentrypanelCtrl', {$scope: scope});
            scope.$digest();
        }));
        
        it('should initialize the area entry by calling the rest service', inject(function() {
            expect(fishActRestServSpy.getFishingActivity).toHaveBeenCalled();
            expect(fishActRestServSpy.reloadFromActivityHistory).toBeFalsy();
        }));
    });


    describe('Loading of the area entry by faHistoryNavigator', function(){
        beforeEach(inject(function($rootScope, $controller) {
            buildMocks();
            fishActRestServSpy.reloadFromActivityHistory = true;
            scope = $rootScope.$new();
            ctrl = $controller('AreaentrypanelCtrl', {$scope: scope});
            scope.$digest();
        }));
        
        it('should initialize the area entry through faHistoryNavigator', inject(function() {
            expect(fishActRestServSpy.getFishingActivity).not.toHaveBeenCalled();
            expect(fishActRestServSpy.reloadFromActivityHistory).toBeFalsy();
        }));
    });

});



