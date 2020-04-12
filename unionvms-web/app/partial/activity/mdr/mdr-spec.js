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
describe('MdrCtrl', function() {

    var scope,ctrl,userServSpy,mdrRestServSpy;

    beforeEach(module('unionvmsWeb'));

    beforeEach(function(){
        userServSpy = jasmine.createSpyObj('userService', ['isAllowed','getRoleName','getScopeName']);
        mdrRestServSpy = jasmine.createSpyObj('mdrRestService', ['getCronJobExpression','getAcronymsDetails','updateCronJobExpression','syncNow','syncAllNow','enableDisableScheduledUpdate']);
        
        module(function($provide){
            $provide.value('userService', userServSpy);
            $provide.value('mdrRestService', mdrRestServSpy);
        });
    });

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});

    }));

    function getCronJobExpression(){
        return "40 4 25 4 *";
    }

    function getAcronymsDetails(){
        return [
                {
                    "code": "AAA",
                    "scientificName": "Acipenser naccarii",
                    "englishName": "Adriatic sturgeon",
                    "frenchName": "Esturgeon de l'Adriatique",
                    "spanishName": "Esturinn del Adrictico",
                    "author": "Bonaparte 1836",
                    "family": "Acipenseridae",
                    "order": "ACIPENSERIFORMES",
                    "validity": {
                    	"endDate": "2100-12-31T00:00:00",
                    	"startDate": "2100-12-31T00:00:00"
                    }
                },
                {
                    "code": "AAB",
                    "scientificName": "Acanthopagrus bifasciatus",
                    "englishName": "Twobar seabream",
                    "frenchName": "Pagre double bande",
                    "spanishName": "Sargo de dos bandas",
                    "author": "Forsskbl 1775",
                    "family": "Sparidae",
                    "order": "PERCOIDEI",
                    "validity": {
                    	"endDate": "2100-12-31T00:00:00",
                    	"startDate": "2100-12-31T00:00:00"
                    }
                },
                {
                    "code": "AAC",
                    "scientificName": "Amia calva",
                    "englishName": "Bowfin",
                    "frenchName": "",
                    "spanishName": "",
                    "author": "Linnaeus 1766",
                    "family": "Amiidae",
                    "order": "AMIIFORMES",
                    "validity": {
                    	"endDate": "2100-12-31T00:00:00",
                    	"startDate": "2100-12-31T00:00:00"
                    }
                }
            ];
    }

    function getMDRCodeListsWithSelected(){
        return [
                {
                    "code": "AAA",
                    "scientificName": "Acipenser naccarii",
                    "englishName": "Adriatic sturgeon",
                    "frenchName": "Esturgeon de l'Adriatique",
                    "spanishName": "Esturinn del Adrictico",
                    "author": "Bonaparte 1836",
                    "family": "Acipenseridae",
                    "order": "ACIPENSERIFORMES"
                },
                {
                    "code": "AAB",
                    "scientificName": "Acanthopagrus bifasciatus",
                    "englishName": "Twobar seabream",
                    "frenchName": "Pagre double bande",
                    "spanishName": "Sargo de dos bandas",
                    "author": "Forsskbl 1775",
                    "family": "Sparidae",
                    "order": "PERCOIDEI",
                    "isSelected": "true"
                },
                {
                    "code": "AAC",
                    "scientificName": "Amia calva",
                    "englishName": "Bowfin",
                    "frenchName": "",
                    "spanishName": "",
                    "author": "Linnaeus 1766",
                    "family": "Amiidae",
                    "order": "AMIIFORMES"
                }
            ];
    }

    function updateCronJobExpression(){
        return {
            "code":200
        };
    }

    function syncNow(){
        return {
            "data":{
                "status":"OK",
                "messages":{

                },
                "counter":0,
                "includedObject":[
                    {
                        "id":13,
                        "objectAcronym":"RELOCATION_DESTINATION",
                        "objectName":"",
                        "objectDescription":null,
                        "objectSource":null,
                        "lastAttempt":1478789501775,
                        "lastSuccess":null,
                        "validity":null,
                        "lastStatus":"RUNNING",
                        "schedulable":true,
                        "versions":null
                    },
                    {
                        "id":14,
                        "objectAcronym":"VEHICLE_TYPE",
                        "objectName":"",
                        "objectDescription":null,
                        "objectSource":null,
                        "lastAttempt":1478789501789,
                        "lastSuccess":null,
                        "validity":null,
                        "lastStatus":"RUNNING",
                        "schedulable":true,
                        "versions":null
                    },
                    {
                        "id":15,
                        "objectAcronym":"FLUX_CONTACT_ROLE",
                        "objectName":"",
                        "objectDescription":null,
                        "objectSource":null,
                        "lastAttempt":1478789501805,
                        "lastSuccess":null,
                        "validity":null,
                        "lastStatus":"RUNNING",
                        "schedulable":true,
                        "versions":null
                    }
                ],
                "ok":true
            },
            "code":200
        };
    }

    function syncAllNow(){
        return syncNow();
    }

    function enableDisableScheduledUpdate(){
        return {code: 200};
    }

    function buildMocks(){
        userServSpy.isAllowed.andCallFake(function(){
          return true;
        });

        mdrRestServSpy.getCronJobExpression.andCallFake(function(){
          return {
              then: function(callback){
                  return callback(getCronJobExpression());
              }
          };
        });

        mdrRestServSpy.getAcronymsDetails.andCallFake(function(){
          return {
              then: function(callback){
                  return callback(getAcronymsDetails());
              }
          };
        });

        mdrRestServSpy.updateCronJobExpression.andCallFake(function(){
          return {
              then: function(callback){
                  return callback(updateCronJobExpression());
              }
          };
        });

        mdrRestServSpy.syncNow.andCallFake(function(){
          return {
              then: function(callback){
                  return callback(syncNow());
              }
          };
        });

        mdrRestServSpy.syncAllNow.andCallFake(function(){
          return {
              then: function(callback){
                  return callback(syncAllNow());
              }
          };
        });
        
        mdrRestServSpy.enableDisableScheduledUpdate.andCallFake(function(){
          return {
              then: function(callback){
                  return callback(enableDisableScheduledUpdate());
              }
          };
        });
        
    }

    it('should not load if not allowed', inject(function($rootScope,$controller) {
        userServSpy.isAllowed.andCallFake(function(){
          return false;
        });

        scope = $rootScope.$new();

        ctrl = $controller('MdrCtrl', {
            $scope: scope
        });

        scope.$digest();

        expect(mdrRestServSpy.getCronJobExpression).not.toHaveBeenCalled();
        expect(mdrRestServSpy.getAcronymsDetails).not.toHaveBeenCalled();

        scope.selectedAll = true;
        scope.selectDeselectAll();
    }));

    describe('should load if allowed', function() {

        beforeEach(inject(function($rootScope, $controller) {
            buildMocks();
            scope = $rootScope.$new();

            ctrl = $controller('MdrCtrl', {
                $scope: scope
            });

            scope.$digest();
        }));

        it('should save the scheduler settings', inject(function() {
            scope.mdrConfigurationForm = {'$dirty': false};
            scope.saveCron();
            expect(mdrRestServSpy.updateCronJobExpression).not.toHaveBeenCalled();

            scope.mdrConfigurationForm = {'$dirty': true};
            scope.saveCron();
            expect(mdrRestServSpy.updateCronJobExpression).toHaveBeenCalled();
        }));


        it('should synchronize selected mdr codes', inject(function() {
            angular.copy(getMDRCodeListsWithSelected(),scope.mdrCodeLists);
            scope.displayedMDRLists = [].concat(scope.mdrCodeLists);
            
            scope.$digest();

            scope.updateNow();
            expect(mdrRestServSpy.syncNow).toHaveBeenCalled();
        }));

        it('should synchronize all mdr codes', inject(function() {
            scope.displayedMDRLists[0].isSelected = true;
            scope.displayedMDRLists[1].isSelected = true;

            scope.enableDisableSynchButton();

            scope.updateAllNow();
            expect(mdrRestServSpy.syncAllNow).toHaveBeenCalled();
        }));

        it('should change auto update property', inject(function() {
            expect(scope.displayedMDRLists[1].schedulable).toBe(undefined);

            scope.enableDisableAutoUpdate(1);
            expect(scope.displayedMDRLists[1].schedulable).toEqual(true);
            expect(mdrRestServSpy.enableDisableScheduledUpdate).toHaveBeenCalled();
        }));

        it('should select the whole mdr page', inject(function() {
            expect(scope.selectedAll).toBe(false);

            angular.forEach(scope.displayedMDRLists,function(item){
                expect(item.isSelected).not.toBe(true);
                item.isSelected = true;
                scope.enableDisableSynchButton();
            });
            
            expect(scope.selectedAll).toBe(true);

            scope.selectedAll = false;
            scope.selectDeselectAll();
            scope.enableDisableSynchButton();
            expect(scope.selectedAll).toBe(false);

            angular.forEach(scope.displayedMDRLists,function(item){
                expect(item.isSelected).toBe(false);
            });

            scope.selectedAll = true;
            scope.selectDeselectAll();
            expect(scope.selectedAll).toBe(true);

            angular.forEach(scope.displayedMDRLists,function(item){
                expect(item.isSelected).toBe(true);
            });

        }));


//        it('should open the code list modal', inject(function() {
//            scope.openCodeListModal();
//            /*expect(scope.displayedMDRLists[1].schedulable).toBe(undefined);
//
//            scope.enableDisableAutoUpdate(1);
//            expect(scope.displayedMDRLists[1].schedulable).toEqual(true);
//            expect(mdrRestServSpy.enableDisableScheduledUpdate).toHaveBeenCalled();*/
//        }));

    });
});

