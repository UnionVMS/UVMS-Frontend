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
describe('analogClock', function() {

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
        $httpBackend.whenGET(/globals/).respond({ data: [] });
    }));

    afterEach(function() {
        angular.element('analog-clock').remove();
    });

    function buildMockData() {
        return "2018-01-07T08:35:01"
    }

    it('should render analog clock', inject(function() {
        scope.clockData = buildMockData();

        tile = compile('<analog-clock clockData="clockData"></analog-clock>')(scope);
        tile.appendTo('#parent-container');
        scope.$digest();

        expect(angular.element('analog-clock').length).toBe(1);

    }));
});
