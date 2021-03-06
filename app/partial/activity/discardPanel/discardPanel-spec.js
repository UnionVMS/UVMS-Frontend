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
angular.module('stateMock', []);
angular.module('stateMock').service("$state", function ($q) {
    this.current = {
        name: ''
    };

    this.go = function (stateName) {
        this.current.name = stateName;
    };
});

describe('DiscardpanelCtrl with app states', function () {
    beforeEach(module('unionvmsWeb'));
    beforeEach(module('stateMock'));

    var scope, ctrl, mockState, $state, mockTripSumServ, appStates;

    beforeEach(function () {
        appStates = ['', 'app.reporting', 'app.reporting-id'];

        mockTripSumServ = {
            withMap: false
        };

        module(function ($provide) {
            $provide.value('tripSummaryService', mockTripSumServ);
        });
    });

    beforeEach(inject(function ($rootScope, $controller, _$state_, $injector, $httpBackend) {
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({ data: [] });
        $httpBackend.whenGET(/movement/).respond();

        $state = _$state_;
        scope = $rootScope.$new();
        ctrl = $controller('DiscardpanelCtrl', { $scope: scope });
    }));

    function setWithMap(newState) {
        mockTripSumServ.withMap = newState;
    }

    it('should allow a location to be clickable when report has map and the application is on the reporting router', inject(function () {
        setWithMap(true);
        appStates.splice(0, 1);
        var test;
        angular.forEach(appStates, function (state) {
            $state.go(state);
            test = scope.faServ.isLocationClickable();
            expect(test).toBeTruthy();
        });
    }));

    it('should not allow a location to be clickable if report has no map', function () {
        var test;
        angular.forEach(appStates, function (state) {
            $state.go(state);
            test = scope.faServ.isLocationClickable();
            expect(test).toBeFalsy();
        });
    });

    it('should not allow a location to be clickable if the application is not on the reporting router', function () {
        setWithMap(true);
        $state.go(appStates[0]);
        var test = scope.faServ.isLocationClickable();
        expect(test).toBeFalsy();
    });

});

describe('DiscardpanelCtrl', function() {

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
    
    describe('Standard loading of the discard', function(){
        beforeEach(inject(function($rootScope, $controller) {
            buildMocks();
            fishActRestServSpy.reloadFromActivityHistory = false;
            scope = $rootScope.$new();
            ctrl = $controller('DiscardpanelCtrl', {$scope: scope});
            scope.$digest();
        }));
        
        it('should initialize the discard by calling the rest service', inject(function() {
            expect(fishActRestServSpy.getFishingActivity).toHaveBeenCalled();
            expect(fishActRestServSpy.reloadFromActivityHistory).toBeFalsy();
        }));
    });


    describe('Loading of the discard by faHistoryNavigator', function(){
        beforeEach(inject(function($rootScope, $controller) {
            buildMocks();
            fishActRestServSpy.reloadFromActivityHistory = true;
            scope = $rootScope.$new();
            ctrl = $controller('DiscardpanelCtrl', {$scope: scope});
            scope.$digest();
        }));
        
        it('should initialize the discard through faHistoryNavigator', inject(function() {
            expect(fishActRestServSpy.getFishingActivity).not.toHaveBeenCalled();
            expect(fishActRestServSpy.reloadFromActivityHistory).toBeFalsy();
        }));
    });

});

