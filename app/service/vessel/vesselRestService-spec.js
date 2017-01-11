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
describe('vesselRestService', function() {

    beforeEach(module('unionvmsWeb'));

    //MOCK RESOURCE
    beforeEach(function () {
        var mockResource = {
            vessel: function() {
                return {
                    get: function(getObject, callback) {
                        //Success if id is defined, 500 otherwize
                        if(angular.isDefined(getObject.id)){
                            callback({
                                code : 200,
                                data: {
                                    name : "1"
                                }
                            });
                        }else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                    save: function(vesselDTO, callback) {
                        //Success if name is defined, 500 otherwize
                        if(angular.isDefined(vesselDTO.name)){
                            callback({
                                code : 200,
                                data: {
                                    name : vesselDTO.name
                                }
                            });
                        }else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                    update: function(vesselDTO, callback) {
                        //Success if name is defined, 500 otherwize
                        if(angular.isDefined(vesselDTO.name)){
                            callback({
                                code : 200,
                                data: {
                                    name : vesselDTO.name
                                }
                            });
                        }else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                }
            },
            vesselGroup: function() {
                return {
                    get: function(getObject, callback) {
                        //Success if id is defined, 500 otherwize
                        if(angular.isDefined(getObject.id)){
                            callback({
                                code : 200,
                                data: {
                                    name : "1"
                                }
                            });
                        }else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                    save: function(vesselGroupDTO, callback) {
                        //Success if name is defined, 500 otherwize
                        if(angular.isDefined(vesselGroupDTO.name)){
                            callback({
                                code : 200,
                                data: {
                                    name : vesselGroupDTO.name
                                }
                            });
                        }else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                    update: function(vesselGroupDTO, callback) {
                        //Success if name is defined, 500 otherwize
                        if(angular.isDefined(vesselGroupDTO.name)){
                            callback({
                                code : 200,
                                data: {
                                    name : vesselGroupDTO.name
                                }
                            });
                        }else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                    delete: function(getObject, callback) {
                        //Success if id is defined, 500 otherwize
                        if(angular.isDefined(getObject.id)){
                            callback({
                                code : 200,
                                data: {
                                    guid : getObject.id
                                }
                            });
                        }else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                }
            },
            //List of vessels
            getVesselList: function() {
                return {
                    list: function(getListRequest, callback) {
                        //Success if page = 1, otherwize return 500
                        if(getListRequest.pagination.page === 1){
                            callback({
                                code : 200,
                                data: {
                                    asset: [
                                        {
                                            name: "1",
                                        },
                                        {
                                            name: "2",
                                        }
                                    ],
                                    currentPage : 12,
                                    totalNumberOfPages : 23
                                }
                            });
                        }
                        else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                }
            },
            //List of vesselsGroups for user
            getVesselGroupsForUser: function() {
                return {
                    get: function(getObject, callback) {
                        //Success if user is TEST
                        if(getObject.user === 'TEST'){
                            callback({
                                code : 200,
                                data: [
                                    {
                                        guid: "ABC",
                                    },
                                    {
                                        guid: "DEF",
                                    }
                                ],
                            });
                        }
                        else{
                            callback({
                                code : 500,
                            });
                        }
                    },
                }
            },
        };

        module(function ($provide) {
            $provide.value('vesselRestFactory', mockResource);
        });

    });

    beforeEach(inject(function($httpBackend) {
        httpBackend = $httpBackend;
        //Mock
        httpBackend.whenGET(/usm/).respond();
        httpBackend.whenGET(/i18n/).respond();
        httpBackend.whenGET(/globals/).respond({data : []});
    }));

    describe('updateVessel', function() {
        it("updateVessel should send request to backend and return received object", inject(function($rootScope, vesselRestService, Vessel) {
            var vessel = new Vessel();
            vessel.name = "CLOSED";

            var resolved = false;
            vesselRestService.updateVessel(vessel).then(function(updatedVessel){
                resolved = true;
                expect(updatedVessel.name).toEqual(vessel.name);
                expect(updatedVessel instanceof Vessel).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));


        it("updateVessel should reject promise in case of error", inject(function($rootScope, vesselRestService, Vessel) {
            var vessel = new Vessel();
            vessel.name = undefined;

            var rejected = false;
            vesselRestService.updateVessel(vessel).then(function(updatedVessel){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });

    describe('createNewVessel', function() {
        it("createNewVessel should send request to backend and return received object", inject(function($rootScope, vesselRestService, Vessel) {
            var vessel = new Vessel();
            vessel.name = "CLOSED";

            var resolved = false;
            vesselRestService.createNewVessel(vessel).then(function(createdVessel){
                resolved = true;
                expect(createdVessel.name).toEqual(vessel.name);
                expect(createdVessel instanceof Vessel).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));


        it("createNewVessel should reject promise in case of error", inject(function($rootScope, vesselRestService, Vessel) {
            var vessel = new Vessel();
            vessel.name = undefined;

            var rejected = false;
            vesselRestService.createNewVessel(vessel).then(function(updatedVessel){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });

    describe('getVesselList', function() {
        it("getVesselList should return list of vessels", inject(function($rootScope, vesselRestService, GetListRequest, Vessel) {
            var getListRequest = new GetListRequest();

            var resolved = false;
            vesselRestService.getVesselList(getListRequest).then(function(page){
                resolved = true;
                expect(page.currentPage).toEqual(12);
                expect(page.totalNumberOfPages).toEqual(23);
                expect(page.getNumberOfItems()).toEqual(2);
                expect(page.items[0] instanceof Vessel).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);

        }));


        it("getVesselList should reject promise in case of error", inject(function($rootScope, vesselRestService, GetListRequest) {
            var getListRequest = new GetListRequest();
            getListRequest.page = 0;

            var rejected = false;
            vesselRestService.getVesselList(getListRequest).then(function(page){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });

    describe('getAllMatchingVessels', function() {
        it("getAllMatchingVessels should return list of vessels", inject(function($rootScope, vesselRestService, GetListRequest, Vessel) {
            var getListRequest = new GetListRequest();

            var resolved = false;
            vesselRestService.getAllMatchingVessels(getListRequest).then(function(vessels){
                resolved = true;
                expect(vessels.length).toEqual(2);
                expect(vessels[0] instanceof Vessel).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);

        }));


        it("getAllMatchingVessels should reject promise in case of error", inject(function($rootScope, vesselRestService, GetListRequest) {
            var getListRequest = new GetListRequest();
            getListRequest.page = 0;

            var rejected = false;
            vesselRestService.getAllMatchingVessels(getListRequest).then(function(vessels){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });

    describe('getVessel', function() {
        it("getVessel should send request to backend and return received object", inject(function($rootScope, vesselRestService, Vessel) {
            var resolved = false;
            vesselRestService.getVessel("TEST").then(function(foundVessel){
                resolved = true;
                expect(foundVessel.name).toBeDefined();
                expect(foundVessel instanceof Vessel).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));


        it("getVessel should reject promise in case of error", inject(function($rootScope, vesselRestService, Vessel) {
            var rejected = false;
            vesselRestService.getVessel().then(function(foundVessel){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });

    describe('updateVesselGroup', function() {
        it("updateVesselGroup should send request to backend and return received object", inject(function($rootScope, vesselRestService, SavedSearchGroup) {
            var vesselGroup = new SavedSearchGroup();
            vesselGroup.name = "TEST";
            vesselGroup.searchFields = [];

            var resolved = false;
            vesselRestService.updateVesselGroup(vesselGroup).then(function(updatedVesselGroup){
                resolved = true;
                expect(updatedVesselGroup.name).toEqual(vesselGroup.name);
                expect(updatedVesselGroup instanceof SavedSearchGroup).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));


        it("updateVesselGroup should reject promise in case of error", inject(function($rootScope, vesselRestService, SavedSearchGroup) {
            var vesselGroup = new SavedSearchGroup();
            vesselGroup.name = undefined;
            vesselGroup.searchFields = [];

            var rejected = false;
            vesselRestService.updateVesselGroup(vesselGroup).then(function(updatedVesselGroup){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });

    describe('createNewVesselGroup', function() {
        it("createNewVesselGroup should send request to backend and return received object", inject(function($rootScope, vesselRestService, SavedSearchGroup) {
            var vesselGroup = new SavedSearchGroup();
            vesselGroup.name = "TEST";
            vesselGroup.searchFields = [];

            var resolved = false;
            vesselRestService.createNewVesselGroup(vesselGroup).then(function(createdVesselGroup){
                resolved = true;
                expect(createdVesselGroup.name).toEqual(vesselGroup.name);
                expect(createdVesselGroup instanceof SavedSearchGroup).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));


        it("createNewVesselGroup should reject promise in case of error", inject(function($rootScope, vesselRestService, SavedSearchGroup) {
            var vesselGroup = new SavedSearchGroup();
            vesselGroup.name = undefined;
            vesselGroup.searchFields = [];

            var rejected = false;
            vesselRestService.createNewVesselGroup(vesselGroup).then(function(createdVesselGroup){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });

    describe('deleteVesselGroup', function() {
        it("deleteVesselGroup should send request to backend and return deleted object", inject(function($rootScope, vesselRestService, SavedSearchGroup) {
            var vesselGroup = new SavedSearchGroup();
            vesselGroup.id = "TEST";
            vesselGroup.searchFields = [];

            var resolved = false;
            vesselRestService.deleteVesselGroup(vesselGroup).then(function(deletedVesselGroup){
                resolved = true;
                expect(deletedVesselGroup.id).toEqual(vesselGroup.id);
                expect(deletedVesselGroup instanceof SavedSearchGroup).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        }));


        it("deleteVesselGroup should reject promise in case of error", inject(function($rootScope, vesselRestService, SavedSearchGroup) {
            var vesselGroup = new SavedSearchGroup();
            vesselGroup.id = undefined;
            vesselGroup.searchFields = [];

            var rejected = false;
            vesselRestService.deleteVesselGroup(vesselGroup).then(function(deletedVesselGroup){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);

        }));
    });

    describe('getVesselGroupsForUser', function() {
        it("getVesselGroupsForUser should send request to backend and return deleted object", inject(function($rootScope, vesselRestService, SavedSearchGroup, userService) {
            var userNameSpy = spyOn(userService, 'getUserName').andReturn('TEST');
            var resolved = false;
            vesselRestService.getVesselGroupsForUser().then(function(vesselGroups){
                resolved = true;
                expect(vesselGroups.length).toEqual(2);
                expect(vesselGroups[0] instanceof SavedSearchGroup).toBeTruthy();
            });
            $rootScope.$digest();
            expect(resolved).toBe(true, "should be resolved");
            expect(userNameSpy).toHaveBeenCalled();
        }));


        it("getVesselGroupsForUser should reject promise in case of error", inject(function($rootScope, vesselRestService, userService) {
            var userNameSpy = spyOn(userService, 'getUserName').andReturn('ERROR_USER');
            var rejected = false;
            vesselRestService.getVesselGroupsForUser().then(function(vesselGroups){
            },function(err){
                rejected = true;
            });
            $rootScope.$digest();
            expect(rejected).toBe(true);
            expect(userNameSpy).toHaveBeenCalled();
        }));
    });
});