describe('MdrcodelistCtrl', function() {

    beforeEach(module('unionvmsWeb'));

    var scope,ctrl,modalInstance,acronym,$timeout;

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});

    }));

    beforeEach(inject(function($rootScope, $controller, _$timeout_) {

        $timeout = _$timeout_;

        // Create a mock object using spies
        modalInstance = {
          close: jasmine.createSpy('modalInstance.close'),
          dismiss: jasmine.createSpy('modalInstance.dismiss'),
          result: {
            then: jasmine.createSpy('modalInstance.result.then')
          }
        };

        acronym = jasmine.createSpy('acronym');

        scope = $rootScope.$new();

        ctrl = $controller('MdrcodelistCtrl', {
            $scope: scope,
            $modalInstance: modalInstance,
            acronym: acronym
        });

        scope.$digest();
    }));

    it('should ...', inject(function() {
        //TODO create unit test
        expect(1).toEqual(1);
    }));

});
