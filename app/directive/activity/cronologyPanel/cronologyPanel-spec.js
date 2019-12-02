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
describe('cronologyPanel', function() {

    beforeEach(module('unionvmsWeb'));

    var scope,compile,actRestSpy;

    beforeEach(function(){
        actRestSpy = jasmine.createSpyObj('activityRestService', ['getTripCronology']);

        module(function($provide){
            $provide.value('activityRestService', actRestSpy);
        });
    });

    beforeEach(inject(function($rootScope,$compile) {
        scope = $rootScope.$new();
        compile = $compile;
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    beforeEach(inject(function(Trip) {
        scope.trip = new Trip('NOR-TRP-20160517234053706');

        if(!angular.element('#parent-container').length){
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
    }));

    function getTripCronology(){
        return {
            "data": 
            {
                "currentTrip":"NOR-TRP-20160517234053706",
                "selectedTrip":"NOR-TRP-20160517234053706",
                "previousTrips": ["NOR-TRP-20160517234053704","NOR-TRP-20160517234053705"],
                "nextTrips": ["NOR-TRP-20160517234053707","NOR-TRP-20160517234053708"]
            },
            "code":200
        };
    } 

    function buildMocks(){
        actRestSpy.getTripCronology.andCallFake(function(){
            return {
                then: function(callback){
                    return callback(getTripCronology());
                }
            };
        });
    }

    it('should show the catch details', function() {
        buildMocks();
        var cronologyPanel = compile('<cronology-panel trip="trip"></cronology-panel>')(scope);
        scope.$digest();

        cronologyPanel.appendTo('#parent-container');

        expect(angular.element('.cronology-section').length).toEqual(1);
        expect(actRestSpy.getTripCronology).toHaveBeenCalled();

        angular.element('cronology-panel').remove();
        cronologyPanel.isolateScope().$destroy();
    });

});
