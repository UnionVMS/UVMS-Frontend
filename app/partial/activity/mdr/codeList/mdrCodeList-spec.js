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
describe('MdrcodelistCtrl', function() {

    beforeEach(module('unionvmsWeb'));

    var scope,ctrl,modalInstance,acronym,$timeout,createController;

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    beforeEach(inject(function($rootScope, $controller, _$timeout_) {
        $timeout = _$timeout_;
        scope = $rootScope.$new();

        // Create a mock object using spies
        modalInstance = {
            close: jasmine.createSpy('modalInstance.close'),
            dismiss: jasmine.createSpy('modalInstance.dismiss'),
            result: {
                then: jasmine.createSpy('modalInstance.result.then')
            }
        };

        createController = function(){
            return $controller('MdrcodelistCtrl', {
                $scope: scope,
                $uibModalInstance: modalInstance,
                acronym: acronym
            })
        }

    }));

    it('Should be able to close modal', inject(function(){
        acronym = 'GENDER';
        ctrl = createController();
        scope.close();
        expect(modalInstance.close).toHaveBeenCalled();
    }));

    it('Should create the proper columns and attributes for generic acronyms', inject(function() {
        acronym = 'GENDER';
        ctrl = createController();

        expect(scope.columns.length).toEqual(5);
        expect(scope.columns).toEqual(['code', 'description', 'startDate', 'endDate', 'version']);
        expect(scope.searchAttrs.length).toEqual(3);
        expect(scope.searchAttrs).toEqual(['code', 'description', 'version']);
    }));

    it('Should create the proper columns and attributes for more complex acronyms', inject(function() {
        acronym = 'CONVERSION_FACTOR';
        ctrl = createController();

        expect(scope.columns.length).toEqual(11);
        expect(scope.columns).toEqual(['code', 'description', 'state', 'presentation', 'factor', 'placesCode', 'legalSource', 'collective', 'startDate', 'endDate', 'version']);
        expect(scope.searchAttrs.length).toEqual(9);
        expect(scope.searchAttrs).toEqual(['code', 'description', 'version', 'state', 'presentation', 'factor', 'places_code', 'legal_source', 'collective']);
    }));

});

