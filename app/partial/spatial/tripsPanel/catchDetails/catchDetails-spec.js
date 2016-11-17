describe('CatchdetailsCtrl', function () {

    beforeEach(module('unionvmsWeb'));

    var scope, ctrl, activityRestServiceSpy;

    beforeEach(function () {
        activityRestServiceSpy = jasmine.createSpyObj('activityRestService', ['getTripCatchDetail', 'getTripCatchesLandingDetails']);

        module(function ($provide) {
            $provide.value('actRestService', activityRestServiceSpy);
        });
    });

    beforeEach(inject(function ($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({ data: [] });
    }));

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        ctrl = $controller('CatchdetailsCtrl', { $scope: scope });
    }));

    it('should ...', inject(function () {

        expect(1).toEqual(1);

    }));

});
