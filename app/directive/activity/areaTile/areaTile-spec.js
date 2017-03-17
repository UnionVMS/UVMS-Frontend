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
describe('areaTile', function() {

    beforeEach(module('unionvmsWeb'));

    var scope, compile, $httpBackend;

    beforeEach(inject(function($rootScope, $compile, $injector) {
        scope = $rootScope.$new();
        compile = $compile;
        if (!angular.element('#parent-container').length) {
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
        $httpBackend = $injector.get('$httpBackend');;
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({
            data: []
        });
    }));

    afterEach(function() {
        angular.element('area-tile').remove();
    });

    function buildMockData() {
        return {
            "areaData": {
                "transmission": {
                    "occurence": "2018-04-04T19:50:58",
                    "long": -43.18354,
                    "lat": -32.38937
                },
                "crossing": {
                    "occurence": "2017-06-08T11:01:35",
                    "long": 39.474,
                    "lat": -87.1144
                },
                "startFishing": {
                    "occurence": "2017-08-15T23:32:33",
                    "long": 164.33991,
                    "lat": 0.49033
                },
                "startActivity": {
                    "occurence": "2017-11-07T03:00:30",
                    "long": -121.98674,
                    "lat": 26.40755
                }
            },
            "title": "Entry into Area",
            "number": 3
        }

    }

    it('should render area tile and the properties should be defined', inject(function() {
        scope.ngModel = buildMockData();

        tile = compile('<area-tile ng-model="ngModel"></area-tile>')(scope);
        tile.appendTo('#parent-container');
        scope.$digest();

        var testScope = tile.isolateScope();
        expect(testScope.ngModel).toBeDefined();
        expect(testScope.ngModel.title).toBe("Entry into Area");

        expect(angular.element('area-tile').length).toBe(1);
        expect(angular.element(tile).find('.panel-subtitle').text()).toEqual("Entry into Area");
        expect(angular.element(tile).find('.area-subsection')).toBeDefined();
        tile.isolateScope().$destroy();
    }));
});