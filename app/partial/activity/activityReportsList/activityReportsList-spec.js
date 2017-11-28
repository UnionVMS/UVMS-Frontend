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
describe('ActivityreportslistCtrl', function() {
    var scope,ctrl,mockActServ;
    var pageSize = 25;
    
	beforeEach(module('unionvmsWeb'));
	
	beforeEach(function(){
	    mockActServ = {
	        reportsList: {
	            isLoading: false,
	            tableState: undefined,
	            pagination: {
	                offset: 1,
	                pageSize: pageSize,
	                totalPages: undefined
	            },
	            sorting: {
	                sortBy: undefined,
	                reversed: undefined
	            },
	            searchObject: {
	                multipleCriteria: {
	                    PURPOSE: ['1']
	                }
	            }
	        },
	        overview: {},
	        getActivityList: function(callbackFn, tableState){
	            return true;
	        },
	        getHistory: function(){
	            return true;
	        },
	        displayedActivities: buildActivityListMock()
	    };
	    
	    module(function($provide){
	        $provide.value('activityService', mockActServ)
	    });
	});

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      scope.goToView = function(idx){
          return true
      };
      
      ctrl = $controller('ActivityreportslistCtrl', {$scope: scope});
    }));
    
    function buildTblStateMock(){
        return {
            "sort": {
                "predicate": "activityType",
                "reverse": true
            },
            "search": {},
            "pagination": {
                "start": 0,
                "number": 25
            }
        };
    }
    
    function buildActivityListMock(){
        return [{
               "uniqueReportIdList": [{
                   "fluxReportId": "New Id 1",
                   "fluxReportSchemeId": "New scheme Id 1"
               }],
               "faReportID": 2,
               "activityType": "FISHING_OPERATION",
               "occurence": "2016-06-08T13:53:00",
               "dataSource": "FLUX",
               "fromId": ["Owner flux party id 1"],
               "fromName": "This is sample text for owner flux party",
               "vesselIdTypes": {"CFR": "ID 1"},
               "vesselTransportMeansName": "Test Name",
               "purposeCode": "5",
               "FAReportType": "DECLARATION",
               "areas": ["9"],
               "fishingGear": ["Code Type 1"],
               "speciesCode": ["ONBOARD","Species 1"],
               "quantity": [123,123],
               "startDate": "2011-07-01T11:14:00",
               "endDate": "2016-07-01T11:14:00",
               "hasCorrection": true,
               "fluxReportReferenceId": "ID 1",
               "fluxReportReferenceSchemeId": "fhty58-gh586t-5tjf8-t58rjewe"
        }];
    }
    
	/* it('should call the server service with the correct pagination payload', inject(function() {
	    spyOn(mockActServ, 'getActivityList');
	    var tblState = buildTblStateMock();
	    
	    scope.callServer(tblState);
	    expect(mockActServ.reportsList.isLoading).toBeTruthy();
	    expect(mockActServ.reportsList.tableState).toEqual(tblState);
	    
	    var sorting = {
            sortBy: 'ACTIVITY_TYPE',
            reversed: true
	    };
	    
	    expect(mockActServ.reportsList.sorting).toEqual(sorting);
		expect(mockActServ.getActivityList).toHaveBeenCalledWith(jasmine.any(Function), tblState);
		
	}));
	
	it('should call the server service with the correct pagination payload without sorting definitions', inject(function() {
        spyOn(mockActServ, 'getActivityList');
        var tblState = buildTblStateMock();
        tblState.sort.predicate = undefined;
        
        scope.callServer(tblState);
        expect(mockActServ.reportsList.isLoading).toBeTruthy();
        expect(mockActServ.reportsList.tableState).toEqual(tblState);
        
        expect(mockActServ.reportsList.sorting).toEqual({});
        expect(mockActServ.getActivityList).toHaveBeenCalledWith(jasmine.any(Function), tblState);
    })); */
	
	it('should get history data and go to the history partial', function(){
	    spyOn(mockActServ, 'getHistory');
	    spyOn(scope, 'goToView');
	    
	    scope.openHistory(0);
	    
	    expect(mockActServ.overview).toEqual(mockActServ.displayedActivities[0]);
	    expect(mockActServ.getHistory).toHaveBeenCalled();
	    expect(scope.goToView).toHaveBeenCalledWith(1);
	});
	
	it('should get activity details data and go to the details partial', function(){
        spyOn(scope, 'goToView');
        
        scope.openDetails(0);
        
        expect(mockActServ.overview).toEqual(mockActServ.displayedActivities[0]);
        expect(scope.goToView).toHaveBeenCalledWith(5);
    });
});
