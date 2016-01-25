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

        scope.setVesselObj = function(vessel){
            scope.vesselObj = vessel;
        };

        scope.onVesselHistoryListSuccess = function(){
            //Nothing
        };

    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('create new vessel should update vesselObj with created vessel and get vessel history afterwards', inject(function(Vessel, $compile, $q, $httpBackend, vesselRestService, alertService, locale) {
        //Mock REST request
        $httpBackend.whenGET("").respond({});
        $httpBackend.whenPOST("").respond({});

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
        $httpBackend.whenGET("").respond({});
        $httpBackend.whenPOST("").respond({});

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

    it('archive a vessel should open confirmation modal, and then update vesselObj with the archived vessel and remove it from the vessel list', inject(function(Vessel, $compile, $q, $httpBackend, vesselRestService, mobileTerminalRestService, alertService, confirmationModal, locale) {
        scope.removeCurrentVesselFromSearchResults = function(){
            //Nothing
        };
        scope.getOriginalVessel = function(){
            return scope.vesselObj;
        };
        scope.toggleViewVessel = function(){
            return new Vessel();
        };

        //Mock confirmation modal and click on confirm
        var confirmationSpy = spyOn(confirmationModal, "open").andCallFake(function(callback, options){
            callback();
        });

        scope.setCreateMode(false);

        var mockVessel = new Vessel();
        mockVessel.active = true;
        mockVessel.vesselId = {
            type : "GUID",
            value : "345345345-rf54235f-242f-4rads",
            guid: "345345345-rf54235f-242f-4rads"
        };
        scope.vesselObj = mockVessel;

        // A form to be valid
        var element = angular.element('<form name="vesselForm"></form>');
        $compile(element)(scope);

        // Create spies
        var alertSpy = spyOn(alertService, "showSuccessMessageWithTimeout");
        var removeFromListSpy = spyOn(scope, "removeCurrentVesselFromSearchResults");
        var viewListSpy = spyOn(scope, "toggleViewVessel");
        var deferred = $q.defer();
        var getVesselHistorySpy = spyOn(vesselRestService, "getVesselHistoryListByVesselId").andReturn(deferred.promise);
        deferred.resolve([]);

        var deferred2 = $q.defer();
        var getMobileTerminalsSpy = spyOn(mobileTerminalRestService, "getMobileTerminalList").andReturn(deferred2.promise);
        deferred2.resolve([]);

        // Return a mock response for updateVessel
        var deferred = $q.defer();

        var archivedVessel = mockVessel.copy();
        archivedVessel.active = false;
        var archiveVesselSpy = spyOn(vesselRestService, "archiveVessel").andReturn(deferred.promise);
        deferred.resolve(archivedVessel);

        var deferred3 = $q.defer();
        spyOn(mobileTerminalRestService, 'inactivateMobileTerminalsWithConnectId').andReturn(deferred3.promise);
        deferred3.resolve();

        // Archive the vessel
        scope.archiveVessel();
        scope.$digest();

        //Confirmation modal should have been opened
        expect(confirmationSpy).toHaveBeenCalled();

        //Alert message shoudl have been shown
        expect(alertSpy).toHaveBeenCalled();

        //Vessel should have active set to false
        expect(scope.vesselObj.active).toBeFalsy();

        //Check that updateVessel in vesselRestService has been called
        expect(archiveVesselSpy).toHaveBeenCalled();

        //Check that removeCurrentVesselFromSearchResults was called afterwards to remove the vessel from the list
        expect(removeFromListSpy).toHaveBeenCalled();

        //Check that toggleViewVessel was called afterwards to close the form and view the list
        expect(viewListSpy).toHaveBeenCalled();

        // Should have inactivated all mobile terminals belonging to this vessel
        expect(mobileTerminalRestService.inactivateMobileTerminalsWithConnectId).toHaveBeenCalledWith("345345345-rf54235f-242f-4rads");
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


    it('should watch when getVesselObj() changes and update vesselObj, form and get terminals and history when it does', inject(function($rootScope, $q, $compile, Vessel, vesselRestService, mobileTerminalRestService) {
        //Create mock vessels
        var vessel1 = new Vessel();
        var vessel1Name = 'First rule';
        vessel1.name = vessel1Name;
        var vessel2 = new Vessel();
        var vessel2Name = 'Second rule';
        vessel2.name = vessel2Name;
        vessel2.vesselId = {
            guid : "123",
            type : "GUID",
            value : "123"
        };
        scope.vesselObj = vessel1;

        var deferred = $q.defer();
        var getVesselHistorySpy = spyOn(vesselRestService, "getVesselHistoryListByVesselId").andReturn(deferred.promise);
        deferred.resolve([]);

        var deferred2 = $q.defer();
        var getMobileTerminalsSpy = spyOn(mobileTerminalRestService, "getMobileTerminalList").andReturn(deferred2.promise);
        deferred2.resolve([]);

        // Crate form
        var element = angular.element('<form name="vesselForm"></form>');
        $compile(element)(scope);

        //Make form dirty and set submitAttempted to true
        scope.vesselForm.$setDirty();
        scope.submitAttempted = true;
        expect(scope.vesselForm.$pristine).toBeFalsy();

        //Change the vessel so the watch is called
        scope.vesselObj = vessel2;
        scope.$digest();

        expect(getVesselHistorySpy).toHaveBeenCalled();
        expect(getVesselHistorySpy.callCount).toBe(1);
        expect(getMobileTerminalsSpy).toHaveBeenCalled();
        expect(getMobileTerminalsSpy.callCount).toBe(1);
        expect(scope.vesselObj.name).toEqual(vessel2Name);

        //Form should be reset
        expect(scope.submitAttempted).toBeFalsy();
        expect(scope.vesselForm.$pristine).toBeTruthy();
    }));

    it('viewHistoryDetails show open modal with history information', inject(function($rootScope, EventHistory, $modal) {
        var modalSpy = spyOn($modal, "open");

        var historyItem = new EventHistory();
        //View history
        scope.viewHistoryDetails(historyItem);

        expect(modalSpy).toHaveBeenCalled();
        expect(scope.currentVesselHistory).toEqual(historyItem);
    }));

    it('viewCompleteVesselHistory should get all history items from the server', inject(function($rootScope, $compile, $q, Vessel, vesselRestService, mobileTerminalRestService) {
        var deferred = $q.defer();
        var vesselRestServiceSpy = spyOn(vesselRestService, "getVesselHistoryListByVesselId").andReturn(deferred.promise);
        var historyResult = ['a', 'b', 'c'];
        deferred.resolve(historyResult);

        var deferred2 = $q.defer();
        var getMobileTerminalsSpy = spyOn(mobileTerminalRestService, "getMobileTerminalList").andReturn(deferred2.promise);
        deferred2.resolve([]);


        //Create mock vessel
        var mockVessel = new Vessel();
        mockVessel.active = true;
        mockVessel.vesselId = {
            type : "GUID",
            value : "345345345-rf54235f-242f-4rads"
        };
        scope.vesselObj = mockVessel;

        // Create form
        var element = angular.element('<form name="vesselForm"></form>');
        $compile(element)(scope);

        //Show link
        scope.isVisible.showCompleteVesselHistoryLink = true;

        //View history
        scope.viewCompleteVesselHistory();
        scope.$digest();

        //History should have been required from the restService
        expect(vesselRestServiceSpy).toHaveBeenCalled();

        //The link should be hidden
        expect(scope.isVisible.showCompleteVesselHistoryLink).toBeFalsy();

        //The scope.vesselHistory item shold be updated
        expect(scope.vesselHistory).toEqual(historyResult);
    }));

    it('form should be disabled if source is other than INTERNAL', inject(function($rootScope, userService, Vessel) {
        //User is allowed to do everything
        spyOn(userService, "isAllowed").andReturn(true);

        //Create mock vessel
        var mockVessel = new Vessel();
        mockVessel.active = true;
        mockVessel.vesselId = {
            type : "GUID",
            value : "345345345-rf54235f-242f-4rads"
        };
        scope.vesselObj = mockVessel;

        mockVessel.source = 'INTERNAL';
        expect(scope.disableForm()).toBeFalsy('vessel with source INTERNAL should be editable when user has the correct feature');

        mockVessel.source = 'NATIONAL';
        expect(scope.disableForm()).toBeTruthy();
    }));

    it('form should be disabled if user isnt allowed to create or edit vessels', inject(function($rootScope, userService, Vessel) {
        //User is allowed to do nothing
        spyOn(userService, "isAllowed").andReturn(false);

        //Create mock vessel
        var mockVessel = new Vessel();
        mockVessel.active = true;
        mockVessel.vesselId = {
            type : "GUID",
            value : "345345345-rf54235f-242f-4rads"
        };
        scope.vesselObj = mockVessel;

        mockVessel.source = 'INTERNAL';
        expect(scope.disableForm()).toBeTruthy();

        mockVessel.source = 'NATIONAL';
        expect(scope.disableForm()).toBeTruthy();
    }));
});