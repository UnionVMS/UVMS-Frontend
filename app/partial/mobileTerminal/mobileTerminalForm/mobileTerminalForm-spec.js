describe('mobileTerminalFormCtrl', function() {

    beforeEach(module('unionvmsWeb'));

    var scope,ctrl, createResponseTerminal;

    beforeEach(inject(function($rootScope, $controller, MobileTerminal) {
        scope = $rootScope.$new();
        ctrl = $controller('mobileTerminalFormCtrl', {$scope: scope});
        scope.currentMobileTerminal = new MobileTerminal();

        //Dummy response for create
        createResponseTerminal = new MobileTerminal();
        createResponseTerminal.guid = "260";
    }));

    it('should unassign mobile terminal', inject(function($q, mobileTerminalRestService) {
        var deferred = $q.defer();
        spyOn(mobileTerminalRestService, "unassignMobileTerminal").andReturn(deferred.promise);
        scope.unassignVesselWithComment();
        deferred.resolve();
        expect(mobileTerminalRestService.unassignMobileTerminal).toHaveBeenCalled();
    }));

    it('should update currentMobileTerminal with created terminal', inject(function(MobileTerminal, $compile, $q, mobileTerminalRestService, alertService, locale) {
        scope.currentMobileTerminal = new MobileTerminal();

        scope.setCreateMode = function(bool){
            scope.createNewMode = bool;
        };

        scope.getCurrentMobileTerminal = function(){
            return scope.currentMobileTerminal;
        };

        // A form to be valid
        var element = angular.element('<form name="mobileTerminalForm"></form>');
        $compile(element)(scope);

        // Skip alert message
        spyOn(locale, "getString").andReturn();
        spyOn(alertService, "showSuccessMessage").andReturn();
        spyOn(scope, "setCreateMode").andReturn();

        // Return a mock response for createNewMobileTerminal
        var deferred = $q.defer();
        spyOn(mobileTerminalRestService, "createNewMobileTerminal").andReturn(deferred.promise);
        deferred.resolve(createResponseTerminal);

        // Create new terminal and check INTERNAL_ID set on scope
        scope.createNewMobileTerminal();
        scope.$digest();
        expect(scope.currentMobileTerminal.guid).toBe("260");
        
    }));
});
