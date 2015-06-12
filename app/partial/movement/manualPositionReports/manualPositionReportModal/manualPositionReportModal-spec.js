describe('ManualPositionReportModalCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl,getVesselsResponse;

    beforeEach(inject(function($rootScope, $controller, Vessel, VesselListPage, ManualPosition) {
      scope = $rootScope.$new();
      ctrl = $controller('ManualPositionReportModalCtrl', {$scope: scope, $modalInstance: {}, position : new ManualPosition()});
      var vessels = [];
      var vessel1 = new Vessel();
      var vessel2 = new Vessel();
      var vessel3 = new Vessel();
      vessels.push(vessel1);
      vessels.push(vessel2);
      vessels.push(vessel3);
      getVesselsResponse = new VesselListPage(vessels, 1, 1);
    }));	

	it('getVesselsByIrcs should return list of vessels', inject(function($q, vesselRestService, alertService, $httpBackend) {

        //Mock locale file
        $httpBackend.expectGET("").respond({ });

        var deferred = $q.defer();
        spyOn(vesselRestService, "getVesselList").andReturn(deferred.promise);
        deferred.resolve(getVesselsResponse);

        var suggestions;
        scope.getVesselsByIrcs("A").then(function(data) {
            suggestions = data;
        });
        scope.$digest();
		expect(suggestions.length).toEqual(3);		
	}));

    it('getVesselsByCFR should return list of vessels', inject(function($q, vesselRestService, alertService, locale, $httpBackend) {

        //Mock locale file
        $httpBackend.expectGET("").respond({ });

        var deferred = $q.defer();
        spyOn(vesselRestService, "getVesselList").andReturn(deferred.promise);
        deferred.resolve(getVesselsResponse);

        var suggestions;
        scope.getVesselsByCFR("A").then(function(data) {
            suggestions = data;
        });
        scope.$digest();
        expect(suggestions.length).toEqual(3);      
    }));

});