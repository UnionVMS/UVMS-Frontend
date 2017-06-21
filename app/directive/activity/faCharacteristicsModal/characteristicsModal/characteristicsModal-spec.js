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
describe('characteristicsModel', function() {
    beforeEach(module('unionvmsWeb'));

    var scope, ctrl, mockState, $httpBackend, modalInstance, data;

    beforeEach(inject(function($rootScope, $controller, $injector) {
        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({ data: [] });
        $httpBackend.whenGET(/movement/).respond();
        modalInstance = {
            close: jasmine.createSpy('modalInstance.dismiss')
        };
        data = {
            "key1": "value1",
            "key2": "value2"
        }
        scope = $rootScope.$new();
        ctrl = $controller('CharacteristicsModalCtrl', {
            $scope: scope,
            modalData: data,
            $modalInstance: modalInstance
        });

    }));

    it('should properly display the characteristics model ', inject(function() {
        expect(scope.characteristics).toBeDefined();
    }));
});



