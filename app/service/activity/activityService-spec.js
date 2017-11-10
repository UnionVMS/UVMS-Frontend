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
describe('activityService', function() {
    var actServ, mockActRestServ, mockVisServ, mockFishingActServ;
    var pageSize = 25;
    
    beforeEach(module('unionvmsWeb'));
    
    beforeEach(function(){
        mockActRestServ = jasmine.createSpyObj('activityRestService', ['getUserPreferences', 'getActivityList', 'getReportHistory']);
        mockVisServ = jasmine.createSpyObj('visibilityService', ['setVisibility']);
        mockFishingActServ = jasmine.createSpyObj('fishingActivityService', ['resetActivity']);
        
        module(function($provide){
            $provide.value('activityRestService', mockActRestServ);
            $provide.value('visibilityService', mockVisServ);
            $provide.value('fishingActivityService', mockFishingActServ);
        });
    });
    
    beforeEach(inject(function(activityService, $httpBackend){
        actServ = activityService;
  
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
  
    }));
    
    function buildMocks(){
        mockActRestServ.getUserPreferences.andCallFake(function(){
            return {
                then: function(callback){
                    callback({
                        fishingActivityConfig: {
                            summaryReport: ['dataSource','from','startDate','endDate','cfr','ircs','extMark','uvi','iccat','gfcm','purposeCode','reportType','activityType','area','location','gearType','species']
                        }
                    });
                }
            };
        });
        
        mockActRestServ.getActivityList.andCallFake(function(){
            return {
                then: function(callback){
                    callback({
                        resultList: ['activity1', 'activity2'],
                        totalItemsCount: 10
                    });
                }
            };
        });
        
        mockActRestServ.getReportHistory.andCallFake(function(){
            return {
                then: function(callback){
                    callback(['history1', 'history2']);
                }
            };
        });
        
    }
    
    function mockServiceProperties(){
        actServ.activities = ['1', '2', '3'];
        actServ.displayedActivities = ['1', '2', '3'];
        actServ.trips = ['1', '2', '3'];
        actServ.displayedTrips = ['1', '2', '3'];
        actServ.overview = {name: 'overview'};
        actServ.details = {name: 'detais'};
        actServ.history = ['1', '2'];
        actServ.displayedHistory = ['1', '2'];
        actServ.activitiesHistory = ['1', '2', '3', '4'];
        actServ.displayedActivitiesHistory = ['1', '2', '3', '4'];
        
        actServ.reportsList = actServ.reportsList = {
            isLoading: false,
            hasError: false,
            searchObject: {report: 'test'},
            tableState: {
                pagination: {
                    start: 0,
                    number: pageSize,
                    numberOfPages: 1
                }
            },
            pagination: {
                offset: 0,
                pageSize: pageSize,
                totalPages: 1
            },
            sorting: {
                sortBy: 'report',
                reversed: true,
            }
        };
    }
    
    function getInitialReportsListDef(){
        var data = {
            isLoading: false,
            hasError: false,
            searchObject: {},
            tableState: undefined,
            stCtrl: undefined,
            fromForm: false,
            pagination: {
                offset: 0,
                pageSize: pageSize,
                totalPages: undefined
            },
            sorting: {
                sortBy: undefined,
                reversed: undefined,
            }
        };
        
        return data;
    }
    
    function getHistoryListObject(){
        return {
            isLoading: false,
            hasError: false,
            pagination: {
                pageSize: pageSize
            }
        };
    }
    
    function getActivitiesHistoryListObject(){
        return {
            isLoading: false,
            hasError: false
        };
    }

    it('should be properly initialized', function() {
        expect(actServ).toBeDefined();
        expect(actServ.breadcrumbPages).toEqual(jasmine.any(Array));
        expect(actServ.breadcrumbPages.length).toBe(8);
        expect(actServ.activities).toEqual(jasmine.any(Array));
        expect(actServ.activitiesHistory).toEqual(jasmine.any(Array));
        expect(actServ.history).toEqual(jasmine.any(Array));
        expect(actServ.overview).toEqual(jasmine.any(Object));
        expect(actServ.reportsList).toEqual(jasmine.any(Object));
        expect(actServ.selReportDoc).toEqual(jasmine.any(Object));
    });
    
    /* it('should get activity list', function(){
        buildMocks();
        spyOn(actServ, 'clearAttributeByType');
        actServ.getActivityList();
        
        expect(actServ.clearAttributeByType).toHaveBeenCalled();
        expect(actServ.activities.length).toBe(2);
        
        var pag = {
            offset: 0,
            pageSize: 25,
            totalPages: 1
        };
        expect(actServ.reportsList.pagination).toEqual(pag);
    });
    
    
    it('should get activity list and update number of pages', function(){
        buildMocks();
        spyOn(actServ, 'clearAttributeByType');
        
        actServ.reportsList.tableState = {
            pagination: {
                number: pageSize,
                start: 0
            },
            search: {},
            sort: {
                predicate: 'activityType',
                reverse: true
            }
        };
        
        
        actServ.getActivityList();
        
        expect(actServ.clearAttributeByType).toHaveBeenCalled();
        expect(actServ.activities.length).toBe(2);
        
        var pag = {
            offset: 0,
            pageSize: 25,
            totalPages: 1
        };
        expect(actServ.reportsList.pagination).toEqual(pag);
        expect(actServ.reportsList.tableState.pagination.numberOfPages).toEqual(actServ.reportsList.pagination.totalPages);
    }); */
    
    /* it('should get activity list and execute callback function', function(){
        buildMocks();
        spyOn(actServ, 'clearAttributeByType');
        
        var callBackSpy = jasmine.createSpy('callbackFn');
        var callBackObj = {
            fn: callBackSpy
        }
        
        var tblState = {
            pagination: {
                number: pageSize,
                start: 0
            },
            search: {},
            sort: {
                predicate: 'activityType',
                reverse: true
            }
        };
        
        actServ.getActivityList(callBackObj.fn, tblState);
        
        expect(actServ.clearAttributeByType).toHaveBeenCalled();
        expect(actServ.activities.length).toBe(2);
        
        var pag = {
            offset: 0,
            pageSize: 25,
            totalPages: 1
        };
        expect(actServ.reportsList.pagination).toEqual(pag);
        expect(callBackSpy).toHaveBeenCalledWith(tblState);
    }); */
    
    it('should reset the state of the service properties', function(){
        mockServiceProperties();
        actServ.reset();
        
        expect(actServ.activities).toEqual(jasmine.any(Array));
        expect(actServ.activities.length).toEqual(0);
        expect(actServ.displayedActivities).toEqual(jasmine.any(Array));
        expect(actServ.displayedActivities.length).toEqual(0);
        expect(actServ.overview).toEqual(jasmine.any(Object));
        expect(actServ.overview).toEqual({});
        expect(actServ.reportsList).toEqual(jasmine.any(Object));
        expect(actServ.reportsList).toEqual(getInitialReportsListDef());
        expect(actServ.history).toEqual(jasmine.any(Array));
        expect(actServ.history.length).toEqual(0);
        expect(actServ.displayedHistory).toEqual(jasmine.any(Array));
        expect(actServ.displayedHistory.length).toEqual(0);
        expect(actServ.activitiesHistory).toEqual(jasmine.any(Array));
        expect(actServ.activitiesHistory.length).toEqual(0);
        expect(actServ.displayedActivitiesHistory).toEqual(jasmine.any(Array));
        expect(actServ.displayedActivitiesHistory.length).toEqual(0);
        expect(actServ.historyList).toEqual(getHistoryListObject());
        expect(actServ.activitiesHistoryList).toEqual(getActivitiesHistoryListObject());
        expect(actServ.selReportDoc).toEqual(jasmine.any(Object));
        expect(actServ.allPurposeCodes).toEqual(jasmine.any(Array));
        expect(actServ.allPurposeCodes.length).toEqual(0);
    });
    
    it('should clear data by specifying the attribute type', function(){
        mockServiceProperties();
        
        actServ.clearAttributeByType('activities');
        expect(actServ.activities).toEqual(jasmine.any(Array));
        expect(actServ.activities.length).toEqual(0);
        expect(actServ.displayedActivities).toEqual(jasmine.any(Array));
        expect(actServ.displayedActivities.length).toEqual(0);
        
        actServ.clearAttributeByType('history');
        expect(actServ.history).toEqual(jasmine.any(Array));
        expect(actServ.history.length).toEqual(0);
        expect(actServ.displayedHistory).toEqual(jasmine.any(Array));
        expect(actServ.displayedHistory.length).toEqual(0);
        
        actServ.clearAttributeByType('activitiesHistory');
        expect(actServ.history).toEqual(jasmine.any(Array));
        expect(actServ.history.length).toEqual(0);
        expect(actServ.displayedHistory).toEqual(jasmine.any(Array));
        expect(actServ.displayedHistory.length).toEqual(0);
        
        actServ.clearAttributeByType('overview');
        expect(actServ.overview).toEqual(jasmine.any(Object));
        expect(actServ.overview).toEqual({});
    });
    
    it('should clear overview by specifying the type', function(){
        mockServiceProperties();
        actServ.clearAttributeByType('overview');
        
        expect(actServ.overview).toEqual(jasmine.any(Object));
        expect(actServ.overview).toEqual({});
    });
    
    it('should clear activities by specifying the type', function(){
        mockServiceProperties();
        actServ.clearAttributeByType('activities');
        
        expect(actServ.activities).toEqual(jasmine.any(Array));
        expect(actServ.activities.length).toEqual(0);
        expect(actServ.displayedActivities).toEqual(jasmine.any(Array));
        expect(actServ.displayedActivities.length).toEqual(0);
    });
    
    it('should clear activities history by specifying the type', function(){
        mockServiceProperties();
        actServ.clearAttributeByType('activitiesHistory');
        
        expect(actServ.activitiesHistory).toEqual(jasmine.any(Array));
        expect(actServ.activitiesHistory.length).toEqual(0);
        expect(actServ.displayedActivitiesHistory).toEqual(jasmine.any(Array));
        expect(actServ.displayedActivitiesHistory.length).toEqual(0);
        expect(actServ.selReportDoc).toEqual(jasmine.any(Object));
        expect(actServ.selReportDoc).toEqual({});
    });
    
    it('should clear all details by specifying the type', function(){
        mockServiceProperties();
        actServ.clearAttributeByType('details');
        
        expect(mockFishingActServ.resetActivity).toHaveBeenCalled();
    });
    
    it('should reset the reports list tableState', function(){
        mockServiceProperties();
        actServ.resetListTableStates();
        
        var initialState = getInitialReportsListDef();
        expect(actServ.reportsList.pagination).toEqual(initialState.pagination);
        
        var expectedTableState = {
            start: 0,
            number: pageSize,
            numberOfPages: 1
        };
        expect(actServ.reportsList.tableState.pagination).toEqual(expectedTableState);
    });
    
    it('should reset the reports list tableState but not the smartTable state', function(){
        mockServiceProperties();
        actServ.reportsList.tableState = undefined;
        actServ.resetListTableStates();
        
        var initialState = getInitialReportsListDef();
        expect(actServ.reportsList.pagination).toEqual(initialState.pagination);
        
        var expectedTableState = {
            start: 0,
            number: pageSize,
            numberOfPages: 1
        };
        expect(actServ.reportsList.tableState).not.toBeDefined();
    });
    
    it('should get activity user preferences and set visibility settings', function(){
        buildMocks();
        actServ.getUserPreferences();
        expect(mockActRestServ.getUserPreferences).toHaveBeenCalled();
        expect(mockVisServ.setVisibility).toHaveBeenCalled();
    });
    
    it('should get the history for an activity', function(){
        buildMocks();
        actServ.getHistory();
        expect(actServ.history.length).toBe(2);
        expect(actServ.displayedHistory.length).toBe(2);
    });

    it('should get the activities history from a report document', function(){
        buildMocks();
        spyOn(actServ, 'clearAttributeByType');
        
        actServ.getActivitiesHistory(1);
        expect(actServ.clearAttributeByType).toHaveBeenCalled();
        expect(actServ.activitiesHistory.length).toBe(2);
        expect(actServ.displayedActivitiesHistory.length).toBe(2);
    });
});

