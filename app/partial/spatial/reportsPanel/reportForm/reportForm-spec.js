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
describe('ReportformCtrl', function(){

    var scope;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $controller, Report) {
        scope = $rootScope.$new();
        ctrl = $controller('ReportformCtrl', {$scope: scope});
        scope.report = new Report();
    }));

    it('should initialise variables when calling init', inject(function() {
        scope.init();
        expect(scope.report).not.toBeNull();
        expect(scope.formAlert).toEqual({
            visible: false,
            msg: ''
        });
        expect(scope.submitingReport).toEqual(false);
        expect(scope.report.vesselsSelection).toEqual([]);
        expect(scope.showVesselFilter).toEqual(false);
        expect(scope.selectedAreas).toEqual([]);
        expect(scope.shared).toEqual(scope.shared = {
            vesselSearchBy: 'asset',
            searchVesselString: '',
            selectAll: false,
            selectedVessels: 0,
            vessels: [],
            areas: []
        });
    }));
    
    it('should be false when start date after end date', inject(function() {

        var result = scope.validateDates('2010-12-01', '2003-11-01');
        expect(result).toBeFalsy();
    }));

    it('should be true when start date after before date', inject(function() {

        var result = scope.validateDates('2000-12-01', '2003-11-01');
        expect(result).toBeTruthy();
    }));

});
