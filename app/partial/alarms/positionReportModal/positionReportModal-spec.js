describe('PositionReportModalCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl;

    beforeEach(inject(function($rootScope, $controller, ManualPosition) {
        scope = $rootScope.$new();

        //Dummy position
        var position = new ManualPosition();
        position.id = 123456;
        position.speed = 23.3;
        position.course = 134;
        position.time = '2015-04-02 10:12:44';
        position.updatedTime = '2015-04-02 10:12:44';
        position.status = "010";
        position.archived = false;
        position.position.longitude = 11.82;
        position.position.latitude = 54.56;
        position.carrier.cfr ="SWE0001234";
        position.carrier.name ="Nordvåg";
        position.carrier.externalMarking ="VG40";
        position.carrier.ircs ="SKRM";
        position.carrier.flagState ="SWE";
        position.message = {
            status : 'PENDING'
        };

        ctrl = $controller('PositionReportModalCtrl', {$scope: scope, $modalInstance: {}, position: position, options: {}});
    }));	

	it('should ...', inject(function() {

		expect(1).toEqual(1);
		
	}));

});