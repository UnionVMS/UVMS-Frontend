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
describe('PiechartmodalCtrl', function () {

    beforeEach(module('unionvmsWeb'));

    var scope, ctrl, modalInstance, specieData;

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        specieData = { "areaInfo": [{ "areaName": "27.6.b", "weight": 97074.90000000002 }, { "areaName": "GBR", "weight": 48537.450000000004 }, { "areaName": "XCA", "weight": 48537.45 }], "speciesCode": "HAD", "weight": 194149.80000000005, "color": "#519cb8", "tableColor": { "background-color": "rgba(81, 156, 184, 0.7)" }, "$hashKey": "object:4444" };
        ctrl = $controller('PiechartmodalCtrl', {
            $scope: scope,
            $uibModalInstance: modalInstance,
            modalData: specieData,
        });
    }));

    it('should properly display the characteristics model ', inject(function () {
        expect(scope.data).toBeDefined();
    }));
});
