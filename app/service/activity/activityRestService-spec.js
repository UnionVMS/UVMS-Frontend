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
describe('activityRestService', function() {
    var scope, callback, actRestServ, userPrefSpy, actListSpy, tripCronSpy, tripVesselSpy, tripMsgSpy, tripRepSpy, tripCatchesEvolutionSpy;
    
    beforeEach(module('unionvmsWeb'));
  
    function createSpy(name, withData){
        var spy;
        if (withData){
            spy = jasmine.createSpy(name).andCallFake(function(data, callback){
                callback({
                    code: '200',
                    data: {}
                });
            }); 
        } else {
            spy = jasmine.createSpy(name).andCallFake(function(callback){
                callback({
                    code: '200',
                    data: {}
                });
            });
        }
        return spy
    }
    
    beforeEach(module(function($provide){
        //Spy on resolved promises
        callback = jasmine.createSpy('callback');
        
        $provide.value('activityRestFactory', {
            getUserPreferences: function() {
                return {
                    get: userPrefSpy
                };
            },
            getActivityList: function(){
                return {
                    get: actListSpy
                }
            },
            getTripChronology: function(){
                return {
                    get: tripCronSpy
                }
            },
            getTripVessel: function(){
                return {
                    get: tripVesselSpy
                }
            },
            getTripMessageCount: function(){
                return {
                    get: tripMsgSpy
                }
            },
            getTripReports: function(){
                return {
                    get: tripRepSpy
                }
            },
            getTripCatchesEvolution: function() {
                return {
                    get: tripCatchesEvolutionSpy
                }
            }
        });
    }));
    
    beforeEach(inject(function($httpBackend, $rootScope, activityRestService) {
        actRestServ = activityRestService;
        scope = $rootScope;
        
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should get user preferences for the activity module', function() {
        userPrefSpy = createSpy('userPrefSpy', false);
        actRestServ.getUserPreferences().then(callback);
        expect(userPrefSpy).toHaveBeenCalled();
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });
    
    it('should get a list of fishing activities', function(){
        actListSpy = createSpy('actListSpy', true);
        var payload = {
            pagination: {
                offset: 1,
                pageSize:25
            },
            sorting: {
                sortBy: 'ACTIVITY_TYPE',
                reversed: true
            },
            searchCriteriaMap: {}
        }
        
        actRestServ.getActivityList(payload).then(callback);
        expect(actListSpy).toHaveBeenCalledWith(angular.toJson(payload), jasmine.any(Function), jasmine.any(Function));
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });

    it('should get the trip chronology', function(){
        tripCronSpy = createSpy('tripCronSpy', true);
        actRestServ.getTripChronology(1, 5).then(callback);
        expect(tripCronSpy).toHaveBeenCalledWith({id: 1, nrItems: 5}, jasmine.any(Function), jasmine.any(Function));
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });
    
    it('should get the vessel details through the trip id', function(){
        tripVesselSpy = createSpy('tripVesselSpy', true);
        actRestServ.getTripVessel('NOR-TRIP').then(callback);
        expect(tripVesselSpy).toHaveBeenCalledWith({id: 'NOR-TRIP'}, jasmine.any(Function), jasmine.any(Function));
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });
    
    it('should get messages count through the trip id', function(){
        tripMsgSpy = createSpy('tripMsgSpy', true);
        actRestServ.getTripMessageCount('NOR-TRIP').then(callback);
        expect(tripMsgSpy).toHaveBeenCalledWith({id: 'NOR-TRIP'}, jasmine.any(Function), jasmine.any(Function));
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });
     
    it('should get all catches of trip through its id', function(){
        tripRepSpy = createSpy('tripRepSpy', true);
        actRestServ.getTripReports('NOR-TRIP').then(callback);
        expect(tripRepSpy).toHaveBeenCalledWith({id: 'NOR-TRIP'}, jasmine.any(Function), jasmine.any(Function));
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });

    xit(' xxxxxx should get all details of catch evolution of a trip through its id', function(){
        tripRepSpy = createSpy('tripCatchesEvolutionSpy', true);
        actRestServ.getTripCatchesEvolution('NOR-TRIP').then(callback);
        expect(tripCatchesEvolutionSpy).toHaveBeenCalledWith({id: 'NOR-TRIP'}, jasmine.any(Function), jasmine.any(Function));
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });
});

