/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
describe('VesselFormCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl, createResponseVessel;

    var MT_EMPTY_PAGE = {
        items: [],
        currentPage: 0,
        totalNumberOfPages: 0
    };

    beforeEach(inject(function($rootScope, $controller, Vessel) {
        scope = $rootScope.$new();
        ctrl = $controller('VesselFormCtrl', {$scope: scope});
        scope.vesselObj = new Vessel();
        scope.vesselContacts = [];

        //Dummy response for create
        createResponseVessel = new Vessel();
        createResponseVessel.id = "345345345-rf54235f-242f-4rads";

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

        scope.setVesselDetailsDirty = function(bool){
            scope.isVesselDetailsDirty = bool;
        };

        scope.vesselNoteValues = {
            date : "1", 
            activity : "1", 
            source : "INTERNAL"
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

        scope.vesselNoteValues = {
            date : "1", 
            activity : "1", 
            source : "INTERNAL"
        };

        //CreateMode should be true before creation
        expect(scope.isCreateNewMode()).toEqual(true);

        // Create new vessel
        scope.createNewVessel();
        scope.$digest();

        //CreateMode should now be false
        expect(scope.isCreateNewMode()).toEqual(false);

        //VesselID should be set on the vesselObj now
        expect(scope.vesselObj.id).toEqual(createResponseVessel.id);

        //Check that get vessel history was called afterwards
        expect(vesselRestService.getVesselHistoryListByVesselId).toHaveBeenCalledWith(scope.vesselObj.id, 15);

    }));


    it('update a vessel should update vesselObj with the updated vessel and merge into vessel list, and get vessel history afterwards', inject(function(Vessel, $compile, $q, $httpBackend, vesselRestService, alertService, locale) {
        //Mock REST request
        $httpBackend.whenGET("").respond({});
        $httpBackend.whenPOST("").respond({});

        scope.mergeCurrentVesselIntoSearchResults = function(){
            //Nothing
        };

        scope.setCreateMode(false);
        scope.setVesselDetailsDirty(true);

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
        expect(scope.vesselObj.id).toEqual(createResponseVessel.id);

        //Check that get vessel history was called afterwards
        expect(vesselRestService.getVesselHistoryListByVesselId).toHaveBeenCalledWith(scope.vesselObj.id,15);

        //Check that mergeCurrentVesselIntoSearchResults was called afterwards to update the vessel list
        expect(scope.mergeCurrentVesselIntoSearchResults).toHaveBeenCalledWith(scope.vesselObj);
    }));

    it('archive a vessel should open confirmation modal, and then update vesselObj with the archived vessel and remove it from the vessel list', inject(function(Vessel, $compile, $q, $httpBackend, vesselRestService, mobileTerminalRestService, alertService, confirmationModal, locale, MobileTerminal) {
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
        var confirmationSpy = spyOn(confirmationModal, "openInstance").andReturn({result: $q.when('some modal comment')});

        scope.setCreateMode(false);

        var mockVessel = new Vessel();
        mockVessel.active = true;
        mockVessel.id = "345345345-rf54235f-242f-4rads";
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
        var getVesselContactsSpy = spyOn(vesselRestService, "getContactsForAsset").andReturn(deferred.promise);
        var getVesselNotesSpy = spyOn(vesselRestService, "getNotesForAsset").andReturn(deferred.promise);
        deferred.resolve([]);

        var getMobileTerminalsSpy = spyOn(mobileTerminalRestService, "getMobileTerminalList").andReturn($q.when(MT_EMPTY_PAGE));

        // Return a mock response for updateVessel
        var deferred = $q.defer();

        var archivedVessel = mockVessel.copy();
        archivedVessel.active = false;
        var archiveVesselSpy = spyOn(vesselRestService, "archiveVessel").andReturn(deferred.promise);
        deferred.resolve(archivedVessel);

        mt1 = new MobileTerminal();
        mt1.guid = '1234';
        mt2 = new MobileTerminal();
        mt2.guid = '7689';

        // Return list of mobile terminals
        spyOn(mobileTerminalRestService, 'getAllMobileTerminalsWithConnectId').andReturn($q.when([mt1, mt2]));

        spyOn(mobileTerminalRestService, 'inactivateMobileTerminal').andReturn($q.when());
        spyOn(mobileTerminalRestService, 'unassignMobileTerminal').andReturn($q.when());

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

        // Should have inactivated and unassigned all mobile terminals belonging to this vessel
        expect(mobileTerminalRestService.getAllMobileTerminalsWithConnectId).toHaveBeenCalled();
        expect(mobileTerminalRestService.inactivateMobileTerminal).toHaveBeenCalledWith(mt1, 'some modal comment');
        expect(mobileTerminalRestService.inactivateMobileTerminal).toHaveBeenCalledWith(mt2, 'some modal comment');
        expect(mobileTerminalRestService.unassignMobileTerminal).toHaveBeenCalledWith(mt1, 'some modal comment');
        expect(mobileTerminalRestService.unassignMobileTerminal).toHaveBeenCalledWith(mt2, 'some modal comment');
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
        vessel2.id ="123";
        scope.vesselObj = vessel1;

        var deferred = $q.defer();
        var getVesselHistorySpy = spyOn(vesselRestService, "getVesselHistoryListByVesselId").andReturn(deferred.promise);
        var getVesselContactsSpy = spyOn(vesselRestService, "getContactsForAsset").andReturn(deferred.promise);
        var getVesselNotesSpy = spyOn(vesselRestService, "getNotesForAsset").andReturn(deferred.promise);
        deferred.resolve([]);

        var getMobileTerminalsSpy = spyOn(mobileTerminalRestService, "getMobileTerminalList").andReturn($q.when(MT_EMPTY_PAGE));

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
        expect(getVesselContactsSpy).toHaveBeenCalled();
        expect(getVesselContactsSpy.callCount).toBe(1);
        expect(getVesselNotesSpy).toHaveBeenCalled();
        expect(getVesselNotesSpy.callCount).toBe(1);
        expect(getMobileTerminalsSpy).toHaveBeenCalled();
        expect(getMobileTerminalsSpy.callCount).toBe(1);
        expect(scope.vesselObj.name).toEqual(vessel2Name);

        //Form should be reset
        expect(scope.submitAttempted).toBeFalsy();
        expect(scope.vesselForm.$pristine).toBeTruthy();
    }));

    it('viewHistoryDetails show open modal with history information', inject(function($rootScope, Vessel, $uibModal) {
        var modalSpy = spyOn($uibModal, "open");

        var historyItem = new Vessel();
        //View history
        scope.viewHistoryDetails(historyItem);

        expect(modalSpy).toHaveBeenCalled();
        expect(scope.currentVesselHistory).toEqual(historyItem);
    }));

    it('viewCompleteVesselHistory should get all history items from the server', inject(function($rootScope, $compile, $q, Vessel, vesselRestService, mobileTerminalRestService) {
        var deferred = $q.defer();
        var vesselRestServiceSpy = spyOn(vesselRestService, "getVesselHistoryListByVesselId").andReturn(deferred.promise);
        var getVesselContactsSpy = spyOn(vesselRestService, "getContactsForAsset").andReturn(deferred.promise);
        var getVesselNotesSpy = spyOn(vesselRestService, "getNotesForAsset").andReturn(deferred.promise);
        var historyResult = ['a', 'b', 'c'];
        deferred.resolve(historyResult);

        var getMobileTerminalsSpy = spyOn(mobileTerminalRestService, "getMobileTerminalList").andReturn($q.when(MT_EMPTY_PAGE));


        //Create mock vessel
        var mockVessel = new Vessel();
        mockVessel.active = true;
        mockVessel.id = "345345345-rf54235f-242f-4rads";
        scope.vesselObj = mockVessel;

        // Create form
        var element = angular.element('<form name="vesselForm"></form>');
        $compile(element)(scope);

        //Show link
        scope.isThisVisible.showCompleteVesselHistoryLink = true;

        //View history
        scope.viewCompleteVesselHistory();
        scope.$digest();

        //History should have been required from the restService
        expect(vesselRestServiceSpy).toHaveBeenCalled();
        expect(getVesselContactsSpy).toHaveBeenCalled();
        expect(getVesselNotesSpy).toHaveBeenCalled();

        //The link should be hidden
        expect(scope.isThisVisible.showCompleteVesselHistoryLink).toBeFalsy();

        //The scope.vesselHistory item shold be updated
        expect(scope.vesselHistory).toEqual(historyResult);
    }));

    it('form should be disabled if source is other than INTERNAL', inject(function($rootScope, userService, Vessel) {
        //User is allowed to do everything
        spyOn(userService, "isAllowed").andReturn(true);

        //Create mock vessel
        var mockVessel = new Vessel();
        mockVessel.active = true;
        mockVessel.id = "345345345-rf54235f-242f-4rads";
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
        mockVessel.id = "345345345-rf54235f-242f-4rads";
        scope.vesselObj = mockVessel;

        mockVessel.source = 'INTERNAL';
        expect(scope.disableForm()).toBeTruthy();

        mockVessel.source = 'NATIONAL';
        expect(scope.disableForm()).toBeTruthy();
    }));
});
