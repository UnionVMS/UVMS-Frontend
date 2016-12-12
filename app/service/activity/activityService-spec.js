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
    var $q, actServ, mockActRestServ, mockVisServ;
    var listSize = 25;
    
    beforeEach(module('unionvmsWeb'));
    
    beforeEach(function(){
        mockActRestServ = jasmine.createSpyObj('activityRestService', ['getUserPreferences', 'getActivityList']);
        mockVisServ = jasmine.createSpyObj('visibilityService', ['setVisibility']);
        
        module(function($provide){
            $provide.value('activityRestService', mockActRestServ);
            $provide.value('visibilityService', mockVisServ);
        });
    });
    
    beforeEach(inject(function(activityService, $httpBackend, _$q_){
        $q = _$q_;
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
                    })
                }
            }
        });
        
        mockActRestServ.getActivityList.andCallFake(function(){
            return {
                then: function(callback){
                    callback({
                        pagination:{
                            totalPageCount: 10
                        },
                        resultList: ['activity1', 'activity2']
                    })
                }
            }
        });
        
    }
    
    function mockServiceProperties(){
        actServ.activities = ['1', '2', '3'];
        actServ.overview = {name: 'overview'};
        actServ.details = {name: 'detais'};
        
        actServ.reportsList = {
            isLoading: false,
            hasError: false,
            searchObject: {report: 'test'},
            tableState: {
                pagination: {
                    start: 0,
                    number: listSize,
                    numberOfPages: 10
                }
            },
            pagination: {
                page: 1,
                listSize: listSize,
                totalPageCount: 10
            },
            sortKey: {
                field: 'report',
                order: 'ASC',
            }
        };
    }
    
    function getInitialReportsListDef(){
        var data = {
            isLoading: false,
            hasError: false,
            searchObject: {},
            tableState: undefined,
            pagination: {
                page: 1,
                listSize: listSize,
                totalPageCount: undefined
            },
            sortKey: {
                field: undefined,
                order: undefined,
            }
        };
        
        return data;
    }

    it('should be properly initialized', function() {
        expect(actServ).toBeDefined();
        expect(actServ.breadcrumbPages).toEqual(jasmine.any(Array));
        expect(actServ.breadcrumbPages.length).toBe(3);
        expect(actServ.activities).toEqual(jasmine.any(Array));
        expect(actServ.overview).toEqual(jasmine.any(Object));
        expect(actServ.details).toEqual(jasmine.any(Object));
        expect(actServ.reportsList).toEqual(jasmine.any(Object));
    });
    
    //FIXME
//    it('should get activity list', function(){
//        buildMocks();
//        spyOn(actServ, 'clearAttributeByType');
//        actServ.getActivityList();
//        
//        expect(actServ.clearAttributeByType).toHaveBeenCalled();
//        expect(actServ.activities.length).toBe(2);
//        
//        var pag = {
//            page: 1,
//            listSize: 25,
//            totalPageCount: 10
//        };
//        expect(actServ.reportsList.pagination).toEqual(pag);
//    });
    
    //FIXME
//    it('should get activity list and update number of pages', function(){
//        buildMocks();
//        spyOn(actServ, 'clearAttributeByType');
//        
//        actServ.reportsList.tableState = {
//            pagination: {
//                number: listSize,
//                start: 0
//            },
//            search: {},
//            sort: {
//                predicate: 'activityType',
//                reverse: true
//            }
//        };
//        
//        
//        actServ.getActivityList();
//        
//        expect(actServ.clearAttributeByType).toHaveBeenCalled();
//        expect(actServ.activities.length).toBe(2);
//        
//        var pag = {
//            page: 1,
//            listSize: 25,
//            totalPageCount: 10
//        };
//        expect(actServ.reportsList.pagination).toEqual(pag);
//        expect(actServ.reportsList.tableState.pagination.numberOfPages).toEqual(actServ.reportsList.pagination.totalPageCount);
//    });
    
    //FIXME
//    it('should get activity list and execute callback function', function(){
//        buildMocks();
//        spyOn(actServ, 'clearAttributeByType');
//        
//        var callBackSpy = jasmine.createSpy('callbackFn')
//        var callBackObj = {
//            fn: callBackSpy
//        }
//        
//        var tblState = {
//            pagination: {
//                number: listSize,
//                start: 0
//            },
//            search: {},
//            sort: {
//                predicate: 'activityType',
//                reverse: true
//            }
//        };
//        
//        actServ.getActivityList(callBackObj.fn, tblState);
//        
//        expect(actServ.clearAttributeByType).toHaveBeenCalled();
//        expect(actServ.activities.length).toBe(2);
//        
//        var pag = {
//            page: 1,
//            listSize: 25,
//            totalPageCount: 10
//        };
//        expect(actServ.reportsList.pagination).toEqual(pag);
//        expect(callBackSpy).toHaveBeenCalledWith(tblState);
//    });
    
    //FIXME
//    it('should reset the state of the service properties', function(){
//        mockServiceProperties();
//        actServ.reset();
//        
//        expect(actServ.activities).toEqual(jasmine.any(Array));
//        expect(actServ.activities.length).toEqual(0);
//        expect(actServ.overview).toEqual(jasmine.any(Object));
//        expect(actServ.overview).toEqual({});
//        expect(actServ.details).toEqual(jasmine.any(Object));
//        expect(actServ.details).toEqual({});
//        expect(actServ.reportsList).toEqual(jasmine.any(Object));
//        expect(actServ.reportsList).toEqual(getInitialReportsListDef());
//    });
    
    it('should clear activities by specifying the type', function(){
        mockServiceProperties();
        actServ.clearAttributeByType('activities');
        
        expect(actServ.activities).toEqual(jasmine.any(Array));
        expect(actServ.activities.length).toEqual(0);
    });
    
    it('should clear overview by specifying the type', function(){
        mockServiceProperties();
        actServ.clearAttributeByType('overview');
        
        expect(actServ.overview).toEqual(jasmine.any(Object));
        expect(actServ.overview).toEqual({});
    });
    
    it('should clear details by specifying the type', function(){
        mockServiceProperties();
        actServ.clearAttributeByType('details');
        
        expect(actServ.details).toEqual(jasmine.any(Object));
        expect(actServ.details).toEqual({});
    });
    
    //FIXME
//    it('should reset the reports list tableState', function(){
//        mockServiceProperties();
//        actServ.resetReportsListTableState();
//        
//        var initialState = getInitialReportsListDef();
//        expect(actServ.reportsList.pagination).toEqual(initialState.pagination);
//        
//        var expectedTableState = {
//            start: 0,
//            number: listSize,
//            numberOfPages: 1
//        };
//        expect(actServ.reportsList.tableState.pagination).toEqual(expectedTableState);
//    });
    
    it('should reset the reports list tableState but not the smartTable state', function(){
        mockServiceProperties();
        actServ.reportsList.tableState = undefined;
        actServ.resetReportsListTableState();
        
        var initialState = getInitialReportsListDef();
        expect(actServ.reportsList.pagination).toEqual(initialState.pagination);
        
        var expectedTableState = {
            start: 0,
            number: listSize,
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

});

