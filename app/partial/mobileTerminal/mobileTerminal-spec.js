/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
describe('MobileTerminalCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,createController, inmarsatCConfig, iridiumConfig, options1, options2;

    beforeEach(inject(function($rootScope, $controller, TranspondersConfig, TerminalConfig, CapabilityOption) {
        scope = $rootScope.$new();

        createController = function(stateparams){
            if(angular.isUndefined(stateparams)){
                stateparams = {};
            }
            return $controller('MobileTerminalCtrl', {$scope: scope, $stateParams:stateparams});
        }


        //Create terminalConfig for InmarsatC with PLUGIN capability
        inmarsatCConfig = new TerminalConfig();
        inmarsatCConfig.systemType = "INMARSAT_C";
        inmarsatCConfig.viewName = "Inmarsat-C";

        var capabilityOptions = [];
        var options1DTO = {labelName: "BURUM", serviceName: "eu.europa.plugin.inmarsat.burum"};
        options1 = CapabilityOption.fromJson(options1DTO, 'PLUGIN');
        var options2DTO = {labelName: "EIK", serviceName: "eu.europa.plugin.inmarsat.eik"};
        options2 = CapabilityOption.fromJson(options2DTO, 'PLUGIN');
        capabilityOptions.push(options1);
        capabilityOptions.push(options2);

        inmarsatCConfig.capabilities["PLUGIN"] = capabilityOptions;

        //Create terminalConfig for Iridium without PLUGIN capability
        iridiumConfig = new TerminalConfig();
        iridiumConfig.systemType = "IRIDIUM";
        iridiumConfig.viewName = "Iridium";

        //Create TranspondersConfig
        var config = new TranspondersConfig();
        config.terminalConfigs["INMARSAT_C"] = inmarsatCConfig;
        config.terminalConfigs["IRIDIUM"] = iridiumConfig;
        scope.transpondersConfig = config;

    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));


	it('createTransponderSystemDropdownOptions should create correct dropdown values', inject(function() {
        var controller = createController();
        expect(scope.transponderSystems.length).toEqual(0);

        //Create dropdowns
        scope.createTransponderSystemDropdownOptions();

        //Validate dropdowns
        expect(scope.transponderSystems.length).toEqual(3);
        expect(scope.transponderSystems[0].typeAndPlugin).toBeDefined();
        expect(scope.transponderSystems[0].typeAndPlugin.type).toEqual(inmarsatCConfig.systemType);
        expect(scope.transponderSystems[0].typeAndPlugin.plugin.labelName).toEqual(options1.attributes['LABELNAME']);
        expect(scope.transponderSystems[0].typeAndPlugin.plugin.serviceName).toEqual(options1.attributes['SERVICENAME']);

        expect(scope.transponderSystems[1].typeAndPlugin).toBeDefined();
        expect(scope.transponderSystems[1].typeAndPlugin.type).toEqual(inmarsatCConfig.systemType);
        expect(scope.transponderSystems[1].typeAndPlugin.plugin.labelName).toEqual(options2.attributes['LABELNAME']);
        expect(scope.transponderSystems[1].typeAndPlugin.plugin.serviceName).toEqual(options2.attributes['SERVICENAME']);

        expect(scope.transponderSystems[2].typeAndPlugin).toBeDefined();
        expect(scope.transponderSystems[2].typeAndPlugin.type).toEqual(iridiumConfig.systemType);
        expect(scope.transponderSystems[2].typeAndPlugin.plugin.labelName).toBeUndefined();
        expect(scope.transponderSystems[2].typeAndPlugin.plugin.serviceName).toBeUndefined();
	}));

    it('getModelValueForTransponderSystemBySystemTypeAndPlugin should return correct value', inject(function(TranspondersConfig, TerminalConfig, CapabilityOption) {
        var controller = createController();
        //Create dropdowns
        scope.createTransponderSystemDropdownOptions();

        var returnValue = scope.getModelValueForTransponderSystemBySystemTypeAndPlugin(inmarsatCConfig.systemType, options2.attributes['LABELNAME'], options2.attributes['SERVICENAME']);
        expect(returnValue).toBeDefined();
        expect(returnValue.type).toEqual(inmarsatCConfig.systemType);
        expect(returnValue.plugin.labelName).toEqual(options2.attributes['LABELNAME']);
        expect(returnValue.plugin.serviceName).toEqual(options2.attributes['SERVICENAME']);

        returnValue = scope.getModelValueForTransponderSystemBySystemTypeAndPlugin(iridiumConfig.systemType);
        expect(returnValue).toBeDefined();
        expect(returnValue.type).toEqual(iridiumConfig.systemType);
        expect(returnValue.plugin.labelName).toBeUndefined();
        expect(returnValue.plugin.serviceName).toBeUndefined();
    }));

    it('should search for mobile terminals on init', inject(function($q, searchService) {
        var deferred = $q.defer();
        var searchSpy = spyOn(searchService, "searchMobileTerminals").andReturn(deferred.promise);
        var controller = createController();

        expect(searchSpy).toHaveBeenCalled();
    }));

    it('should get mobile terminal by id on init if state param id is available', inject(function(MobileTerminal, $q, searchService, mobileTerminalRestService) {
        var deferred = $q.defer();
        var searchTerminalSpy = spyOn(searchService, "searchMobileTerminals").andReturn(deferred.promise);

        var deferred2 = $q.defer();
        var foundTerminal = new MobileTerminal();
        foundTerminal.associatedVessel = {
            name : 'testName',
            ircs : 'testIrcs'
        };
        deferred2.resolve(foundTerminal);
        var getTerminalByIdSpy = spyOn(mobileTerminalRestService, "getMobileTerminalByGuid").andReturn(deferred2.promise);

        var controller = createController({id:'TEST'});
        var toggleViewTerminalSpy = spyOn(scope, "toggleMobileTerminalDetails");
        scope.$digest();

        //getMobileTerminalByGuid should have been called
        expect(getTerminalByIdSpy).toHaveBeenCalled();
        //toggleViewTerminalSpy should have been called after getting the terminal
        expect(toggleViewTerminalSpy).toHaveBeenCalled();

        //Search terminal shoud have been called afterwards with criterias ircs and name set
        expect(searchTerminalSpy).toHaveBeenCalled();
        expect(searchService.getAdvancedSearchObject().IRCS).toEqual(foundTerminal.associatedVessel.ircs);
        expect(searchService.getAdvancedSearchObject().NAME).toEqual(foundTerminal.associatedVessel.name);

    }));

    it('should get mobile terminal by id on init if state param id is available should handle error', inject(function($q, searchService, mobileTerminalRestService, alertService) {
        var deferred = $q.defer();
        var searchTerminalSpy = spyOn(searchService, "searchMobileTerminals").andReturn(deferred.promise);

        var showErrorAlertSpy = spyOn(alertService, "showErrorMessage");

        var deferred2 = $q.defer();
        deferred2.reject('ERROR');
        var getTerminalByIdSpy = spyOn(mobileTerminalRestService, "getMobileTerminalByGuid").andReturn(deferred2.promise);

        var controller = createController({id:'TEST'});
        var toggleViewTerminalSpy = spyOn(scope, "toggleMobileTerminalDetails");
        scope.$digest();

        //getMobileTerminalByGuid should have been called
        expect(getTerminalByIdSpy).toHaveBeenCalled();
        //toggleViewTerminalSpy should NOT have been called since we failed to get the terminal
        expect(toggleViewTerminalSpy).not.toHaveBeenCalled();

        //alertService.showErrorMessage should have been called after failing to get the terminal
        expect(showErrorAlertSpy).toHaveBeenCalled();

        //Search terminal shoud have been called afterwards
        expect(searchTerminalSpy).toHaveBeenCalled();
    }));

    it('exportTerminalsAsCSVFile should call service for exporting to csv file', inject(function(MobileTerminal, csvService) {
        var controller = createController();

        //Create fake result
        var mobileTerminal = new MobileTerminal();
        scope.currentSearchResults.items.push(mobileTerminal);

        var csvSpy = spyOn(csvService, "downloadCSVFile").andCallFake(function(data, header, filename){
            expect(filename).toEqual('mobileTerminals.csv');
            expect(data.length).toEqual(1);
            expect(header.length).toBeGreaterThan(1, "Should be at least 1 column");
            expect(header.length).toEqual(data[0].length, "Header and data should have equal number of columns");
        });

        scope.exportTerminalsAsCSVFile(false);

        expect(csvSpy).toHaveBeenCalled();
    }));

    describe('search mobile terminals', function() {

        it('searchMobileTerminals should get mobile terminals from the server', inject(function($rootScope, $q, MobileTerminal, searchService, SearchResultListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchMobileTerminals").andReturn(deferred.promise);
            var terminal = new MobileTerminal();
            terminal.guid = "ABCD-123";
            var items = [terminal];
            var results = new SearchResultListPage(items, 1, 10);
            deferred.resolve(results);

            var controller = createController();

            scope.searchMobileTerminals();
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items[0]).toEqual(terminal);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).toEqual('');
        }));


        it('searchMobileTerminals should handle search error', inject(function($rootScope, $q, MobileTerminal, searchService, locale, SearchResultListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchMobileTerminals").andReturn(deferred.promise);
            var searchSpy = spyOn(locale, "getString").andReturn("TRANSLATED_TEXT");
            deferred.reject();

            var controller = createController();

            scope.searchMobileTerminals();
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items.length).toEqual(0);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).not.toEqual('');
        }));

        it('gotoPage should update search page and do a new search', inject(function($rootScope, $q, searchService) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchMobileTerminals").andReturn(deferred.promise);
            var setPageSpy = spyOn(searchService, "setPage");
            deferred.reject();

            var controller = createController();

            var page = 4;
            scope.gotoPage(page);
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();

            expect(setPageSpy).toHaveBeenCalledWith(page);
            expect(searchSpy).toHaveBeenCalled();
        }));

        it('selecting Export in edit selection dropdown should export as csv', inject(function(MobileTerminal) {
            var controller = createController();
            var exportSpy = spyOn(scope, "exportTerminalsAsCSVFile").andCallFake(function(onlySelectedItems){
                expect(onlySelectedItems).toEqual(true);
            });

            scope.selectedMobileTerminals = [new MobileTerminal()];
            var selection = {code:'EXPORT'};
            scope.editSelectionCallback(selection);

            expect(exportSpy).toHaveBeenCalled();
        }));

        it('selecting Poll Terminals in edit selection dropdown should add selected terminals to poll selection and go to poll page', inject(function(MobileTerminal, searchService, pollingService, pollingRestService, SearchResultListPage, PollChannel, $q, $location) {
            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchMobileTerminals").andReturn(deferred.promise);

            var controller = createController();

            //Create fake terminals and select them
            var terminal1 = new MobileTerminal();
            terminal1.connectId = '111';
            var terminal2 = new MobileTerminal();
            //terminal2 has no connected terminal
            var terminal3 = new MobileTerminal();
            terminal3.connectId = '333';
            scope.selectedMobileTerminals = [terminal1, terminal2, terminal3];

            //Spy on location change
            var locationChangeSpy = spyOn($location, "path");

            //Mock getPollablesMobileTerminal
            var deffered2 = $q.defer();
            var channel1 = new PollChannel();
            channel1.comChannelId = 'ABC';
            var channel2 = new PollChannel();
            channel2.comChannelId = 'DEF';
            var items = [channel1, channel2];
            var getPollablesMobileTerminalResponse = new SearchResultListPage(items, 1, 1);
            deffered2.resolve(getPollablesMobileTerminalResponse);
            var getPollablesMobileTerminalSpy = spyOn(pollingRestService, "getPollablesMobileTerminal").andCallFake(function(getPollableListRequest){
                //Validate that the correct connectIds have been added
                expect(getPollableListRequest.connectIds.length).toEqual(2);
                expect(getPollableListRequest.connectIds[0]).toEqual(terminal1.connectId);
                expect(getPollableListRequest.connectIds[1]).toEqual(terminal3.connectId);
                return deffered2.promise;
            });

            //Select Poll in Edit selection dropdown
            var selection = {code:'POLL'};
            scope.editSelectionCallback(selection);
            scope.$digest();

            //We should have asked for pollable termninals
            expect(getPollablesMobileTerminalSpy).toHaveBeenCalled();

            //Location should have changed to polling
            expect(locationChangeSpy).toHaveBeenCalledWith('polling');

            //The pollin wizard should be on step 2
            expect(pollingService.getWizardStep()).toEqual(2);

            //There should be two selected terminals
            expect(pollingService.getNumberOfSelectedTerminals()).toEqual(2);
        }));


        it('allowedToEditMobileTerminals should return true when user has feature manageMobileTerminals', inject(function(userService) {
            var userAllowedSpy = spyOn(userService, "isAllowed").andReturn(true);
            var controller = createController();

            expect(scope.allowedToEditMobileTerminals()).toEqual(true);

            expect(userAllowedSpy).toHaveBeenCalledWith('manageMobileTerminals', 'Union-VMS', true);
        }));

        it('allowedToEditMobileTerminals should return false  when user is missing the feature manageMobileTerminals', inject(function(userService) {
            var userAllowedSpy = spyOn(userService, "isAllowed").andReturn(false);
            var controller = createController();

            expect(scope.allowedToEditMobileTerminals()).toEqual(false);

            expect(userAllowedSpy).toHaveBeenCalledWith('manageMobileTerminals', 'Union-VMS', true);
        }));


        it('should clean up on scope destroy', inject(function($rootScope, alertService, searchService) {
            var controller = createController();
            var alertSpy = spyOn(alertService, "hideMessage");
            scope.$destroy();
            expect(alertSpy).toHaveBeenCalled();
        }));

        it('should not clean up alerts on scope destroy if hideAlertsOnScopeDestroy is set to false', inject(function($rootScope, alertService, searchService) {
            var controller = createController();
            //Set scope.hideAlertsOnScopeDestroy to false
            scope.hideAlertsOnScopeDestroy = false;

            var alertSpy = spyOn(alertService, "hideMessage");

            scope.$destroy();
            expect(alertSpy).not.toHaveBeenCalled();
        }));
    });
});