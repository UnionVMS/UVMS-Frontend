describe('PositionsmapmodalCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl;
    var m1, m2;

    var mockModalInstance = {
        close: function() {},
        dismiss: function() {}
    };

    beforeEach(inject(function($rootScope, $controller, Movement) {
        //Create mock positions
        m1 = new Movement();
        m1.movement.latitude = 12.45;
        m1.movement.longitude = 22.55;
        m1.time = "2015-01-01 12:00";
        m2 = new Movement();
        m2.movement.latitude = 70.11;
        m2.movement.longitude = -13.1;
        m1.time = "2016-01-01 12:00";

        scope = $rootScope.$new();
        ctrl = $controller('positionsMapModalCtrl', {
            $scope: scope,
            $modalInstance: mockModalInstance,
            positionReports : [m1, m2]
        });
    }));

	it('should add markes and set bounds on init', inject(function() {

        //Two markers should have been aded
		expect(Object.keys(scope.markers).length).toEqual(2);

        //Bounds should be set correct
        var expectedBounds = { northEast : { lat : 70.11, lng : 22.55 }, southWest : { lat : 12.45, lng : -13.1 }};
        expect(angular.equals(scope.bounds, expectedBounds)).toBeTruthy();

	}));

});