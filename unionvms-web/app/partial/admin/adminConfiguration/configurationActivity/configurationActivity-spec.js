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
        return {
            "fishingActivityConfig": {
                "summaryReport": {
                    "values": ["FAReportType", "activityType", "occurrence", "purposeCode", "dataSource", "fromName", "startDate", "endDate", "cfr", "ircs", "extMark", "uvi", "iccat", "gfcm", "areas", "port", "fishingGear", "speciesCode", "quantity"],
                    "order": ["FAReportType", "activityType", "occurrence", "purposeCode", "dataSource", "fromName", "startDate", "endDate", "cfr", "ircs", "extMark", "uvi", "iccat", "gfcm", "areas", "port", "fishingGear", "speciesCode", "quantity"]
                }
            },
            "catchThresholds": {
                "critical": null,
                "warning": null
            }
        }
    }
    it('tresholds should be saved', inject(function () {
        scope.configurationCatchThresholdForm = true;
        scope.save();
        expect(spatialConfigRestServiceSpy.saveActivityAdminConfigs.callCount).toBe(1);
        expect(1).toEqual(1);
    }));

});
