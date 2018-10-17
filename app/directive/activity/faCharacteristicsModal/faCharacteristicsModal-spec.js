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
describe('faCharacteristicsModal', function ($uibModal) {

    beforeEach(module('unionvmsWeb'));

    var scope, compile, $httpBackend, modal;

    beforeEach(inject(function ($rootScope, $compile, $injector) {
        scope = $rootScope.$new();
        compile = $compile;
        modal = $uibModal;
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

    afterEach(function () {
        angular.element('fa-characteristics-modal').remove();
    });

    function buildMockData() {
        return {
            "key1": "value1",
            "key2": "value2"
        }

    }

    it('should render fa characteristics modal', inject(function () {
        scope.ngModel = buildMockData();

        tile = compile('<fa-characteristics-modal data="ngModel"  ng-click="openCharacteristicsModal = true"></fa-characteristics-modal>')(scope);
        tile.appendTo('#parent-container');

        scope.$digest();
        expect(scope.openCharacteristicsModal).toBeFalsy();
        tile.triggerHandler('click');
        expect(scope.openCharacteristicsModal).toBe(true);
        var testScope = tile.isolateScope();
        expect(testScope.data).toBeDefined();
        expect(scope.ngModel).toBeDefined();
        expect(scope.ngModel).toBe(scope.ngModel);
        expect(angular.element('fa-characteristics-modal').length).toBe(1);
        tile.isolateScope().$destroy();
    }));
});