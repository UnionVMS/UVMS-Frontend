describe('ReportformCtrl', function(){

    var scope;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        ctrl = $controller('ReportformCtrl', {$scope: scope});
    }));

    it('should initialise variables when calling init', inject(function() {

        scope.init();
        expect(scope.report).not.toBeNull();
        expect(scope.formAlert).toEqual({
            visible: false,
            msg: ''
        });
        expect(scope.submitingReport).toEqual(false);
        expect(scope.vesselsSelectionIsValid).toEqual(true);
        expect(scope.report.vesselsSelection).toEqual([]);
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