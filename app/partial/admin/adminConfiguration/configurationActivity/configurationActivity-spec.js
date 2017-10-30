describe('ConfigurationactivityCtrl', function () {
    beforeEach(module('unionvmsWeb'));

    var scope, ctrl, spatialConfigRestServiceSpy;

    beforeEach(function () {
        spatialConfigRestServiceSpy = jasmine.createSpyObj('spatialConfigRestService', ['saveActivityAdminConfigs']);

        module(function ($provide) {
            $provide.value('spatialConfigRestService', spatialConfigRestServiceSpy);
        });

    });
    beforeEach(inject(function ($rootScope, $controller, $injector) {
        $httpBackend = $injector.get('$httpBackend');
        buildMocks();
        scope = $rootScope.$new();
        ctrl = $controller('ConfigurationactivityCtrl', { $scope: scope });
    }));

    function buildMocks() {

        spatialConfigRestServiceSpy.saveActivityAdminConfigs.andCallFake(function () {
            return {
                then: function (callback) {
                    return callback(saveActivityAdminConfigs());
                }
            }
        });
    }
    function saveActivityAdminConfigs() {
        return { "catchTresholds": { "critical": 90, "warning": 43 } };
    }
    it('tresholds should be saved', inject(function () {
        scope.save();
        expect(spatialConfigRestServiceSpy.saveActivityAdminConfigs.callCount).toBe(1);
        expect(1).toEqual(1);
    }));

});
