describe('AuditsearchformCtrl', function() {

    var scope, createController;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        createController = function(){
            return $controller('AuditsearchformCtrl', {$scope: scope});
        };
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should setup types and operation dropdown values on init', inject(function($q, auditOptionsService) {
        var getCurrentOptionsSpy = spyOn(auditOptionsService, "getCurrentOptions").andCallFake(function(){
            return {
                types : ['a', 'b', 'c'],
                operations : ['add', 'remóve']
            }
        });

        var controller = createController();
        scope.$digest();

        expect(scope.objectTypes.length).toEqual(3);
        expect(scope.operations.length).toEqual(2);

    }));

});