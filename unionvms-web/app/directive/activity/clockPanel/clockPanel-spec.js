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

describe('clockPanel', function () {

    beforeEach(module('unionvmsWeb'));

    var scope, compile, $httpBackend;

    beforeEach(inject(function ($rootScope, $compile, $injector) {
        scope = $rootScope.$new();
        compile = $compile;
        if (!angular.element('#parent-container').length) {
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
        $httpBackend = $injector.get('$httpBackend');;
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({ data: [] });
    }));

    afterEach(function () {
        angular.element('clock-panel').remove();
    });

    function buildMockData() {
        return [{
            "caption": "Estimated time of arrival",
            "reason": "LAND",
            "arrivalTime": "2017-05-26T17:31:30",
            "showClock": "true"
        },
        {
            "caption": "Intended start time of arrival",
            "arrivalTime": "2017-05-26T17:31:30",
            "showClock": "false"
        }];

    }

    it('should render clock panel and the properties should be defined', inject(function ($filter) {
        scope.clockPanalData = buildMockData();

        tile = compile('<clock-panel clockPanalData="clockPanalData"></clock-panel>')(scope);
        tile.appendTo('#parent-container');
        scope.$digest();

        var testScope = tile.isolateScope();

        expect(angular.element('clock-panel').length).toBe(1);

        angular.forEach(testScope.clockPanalData, function (item) {
            var keys = _.keys(item);
            angular.forEach(keys, function (key) {

                expect(item['caption']).toBeDefined();
                expect(item['arrivalTime']).toBeDefined();
                expect(item['showClock']).toBeDefined();

            });
        });

    }));
});