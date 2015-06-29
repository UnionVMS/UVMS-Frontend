describe('VesselFormCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl, createResponseVessel;

    beforeEach(inject(function($rootScope, $controller, Vessel) {
        scope = $rootScope.$new();
        ctrl = $controller('VesselFormCtrl', {$scope: scope});
        scope.vesselObj = new Vessel();

        //Dummy response for create
        createResponseVessel = new Vessel();
        createResponseVessel.vesselId = {
            type : "GUID",
            value : "345345345-rf54235f-242f-4rads"
        };

        scope.setCreateMode = function(bool){
            scope.createNewMode = bool;
        };

        scope.isCreateNewMode = function(bool){
            return scope.createNewMode;
        };

        scope.getVesselObj = function(){
            return scope.vesselObj;
        };

        scope.onVesselHistoryListSuccess = function(){
            //Nothing
        };   

    }));	

    it('create new vessel should update vesselObj with created vessel and get vessel history afterwards', inject(function(Vessel, $compile, $q, $httpBackend, vesselRestService, alertService, locale) {
        //Mock REST request
        $httpBackend.expectPOST("").respond({ });

        scope.setCreateMode(true);

        // A form to be valid
        var element = angular.element('<form name="vesselForm"></form>');
        $compile(element)(scope);

        // Skip alert message
        spyOn(locale, "getString").andReturn();
        spyOn(alertService, "showSuccessMessage").andReturn();

        // Return a mock response for createNewVessel
        var deferred = $q.defer();
        spyOn(vesselRestService, "createNewVessel").andReturn(deferred.promise);
        deferred.resolve(createResponseVessel);

        // Return a mock response for getVesselHistoryListByVesselId
        var deferred2 = $q.defer();
        spyOn(vesselRestService, "getVesselHistoryListByVesselId").andReturn(deferred2.promise);
        deferred2.resolve([]);
        
        //CreateMode should be true before creation
        expect(scope.isCreateNewMode()).toEqual(true);

        // Create new vessel
        scope.createNewVessel();
        scope.$digest();

        //CreateMode should now be false
        expect(scope.isCreateNewMode()).toEqual(false);

        //VesselID should be set on the vesselObj now
        expect(scope.vesselObj.vesselId.type).toEqual(createResponseVessel.vesselId.type);
        expect(scope.vesselObj.vesselId.value).toEqual(createResponseVessel.vesselId.value);

        //Check that get vessel history was called afterwards
        expect(vesselRestService.getVesselHistoryListByVesselId).toHaveBeenCalledWith(scope.vesselObj.vesselId.value,5);
        
    }));


    it('update a vessel should update vesselObj with the updated vessel and merge into vessel list, and get vessel history afterwards', inject(function(Vessel, $compile, $q, $httpBackend, vesselRestService, alertService, locale) {
        //Mock REST request
        $httpBackend.expectPOST("").respond({ });

        scope.mergeCurrentVesselIntoSearchResults = function(){
            //Nothing
        };  

        scope.setCreateMode(false);

        // A form to be valid
        var element = angular.element('<form name="vesselForm"></form>');
        $compile(element)(scope);

        // Skip alert message
        spyOn(locale, "getString").andReturn();
        spyOn(alertService, "showSuccessMessage").andReturn();
        spyOn(scope, "mergeCurrentVesselIntoSearchResults").andReturn();

        // Return a mock response for updateVessel
        var deferred = $q.defer();
        spyOn(vesselRestService, "updateVessel").andReturn(deferred.promise);
        deferred.resolve(createResponseVessel);

        // Return a mock response for getVesselHistoryListByVesselId
        var deferred2 = $q.defer();
        spyOn(vesselRestService, "getVesselHistoryListByVesselId").andReturn(deferred2.promise);
        deferred2.resolve([]);
        
        // Create new vessel
        scope.updateVessel();
        scope.$digest();

        //VesselID should be set on the vesselObj now
        expect(scope.vesselObj.vesselId.type).toEqual(createResponseVessel.vesselId.type);
        expect(scope.vesselObj.vesselId.value).toEqual(createResponseVessel.vesselId.value);

        //Check that get vessel history was called afterwards
        expect(vesselRestService.getVesselHistoryListByVesselId).toHaveBeenCalledWith(scope.vesselObj.vesselId.value,5);

        //Check that mergeCurrentVesselIntoSearchResults was called afterwards to update the vessel list
        expect(scope.mergeCurrentVesselIntoSearchResults).toHaveBeenCalledWith();        
    }));

    it('isVesselNameSet should return correctly', inject(function(Vessel) {
        scope.vesselObj =  new Vessel();
        expect(scope.isVesselNameSet()).toBeFalsy();

        scope.vesselObj.name ="TEST";
        expect(scope.isVesselNameSet()).toBeTruthy();

        scope.vesselObj.name ="";
        expect(scope.isVesselNameSet()).toBeFalsy();
    }));

    it('should detect if more than one active terminals are of the same type', inject(function(MobileTerminal) {
        var mt1 = new MobileTerminal();
        var mt2 = new MobileTerminal();
        mt1.type = mt2.type = "A";
        mt1.active = mt2.active = true;

        var result = scope.getNonUniqueActiveTerminalTypes([mt1, mt2]);
        expect(result["A"]).toBeTruthy();

        mt2.type = "B";
        result = scope.getNonUniqueActiveTerminalTypes([mt1, mt2]);
        expect(result["A"] && result["B"]).toBeFalsy();

        mt2.type = "A";
        mt2.active = false;
        result = scope.getNonUniqueActiveTerminalTypes([mt1, mt2]);
        expect(result["A"] && result["B"]).toBeFalsy();
    }));

    it('should evaluate if there is more than one active terminal of the same type', inject(function() {
        scope.nonUniqueActiveTerminalTypes = { "A": true };

        expect(scope.hasNonUniqueActiveTerminalTypes()).toBeTruthy();
        expect(scope.isNonUniqueActiveTerminalType("A")).toBeTruthy();

        scope.nonUniqueActiveTerminalTypes["A"] = false;
        expect(scope.hasNonUniqueActiveTerminalTypes()).toBeFalsy();
        expect(scope.isNonUniqueActiveTerminalType("A")).toBeFalsy();
    }));
});