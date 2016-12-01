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
describe('tripReportsPanel', function() {

  beforeEach(module('unionvmsWeb'));

  var scope,compile,actRestSpy;

  var reportsData = {
        "fishingTripId":"NOR-TRP-20160517234053706",
        "summary":{
          "DEPARTURE":{
              "date":"2014-05-27T07:47:31",
              "locations":null
          }
        },
        "activityReports":[
          {
              "faReportID":0,
              "activityType":"DEPARTURE",
              "occurence":"2014-05-27T07:47:31",
              "reason":"FISHING",
              "fishingGears":[
                {
                    "gearTypeCode":"GEAR_TYPE"
                }
              ],
              "delimitedPeriod":[
                {
                    "startDate":"2010-06-27T07:47:31",
                    "endDate":"2016-06-27T07:47:31",
                    "duration":1.0
                },
                {
                    "startDate":"2011-02-27T07:47:31",
                    "endDate":"2016-06-27T07:47:31",
                    "duration":3.0
                },
                {
                    "startDate":"2013-02-27T07:47:31",
                    "endDate":"2016-06-27T07:47:31",
                    "duration":3.0
                },
                {
                    "startDate":"2007-02-27T07:47:31",
                    "endDate":"2016-06-27T07:47:31",
                    "duration":3.0
                },
                {
                    "startDate":"2008-02-27T07:47:31",
                    "endDate":"2016-06-27T07:47:31",
                    "duration":3.0
                },
                {
                    "startDate":"2012-02-27T07:47:31",
                    "endDate":"2016-06-27T07:47:31",
                    "duration":3.0
                },
                {
                    "startDate":"2009-04-27T07:47:31",
                    "endDate":"2016-06-27T07:47:31",
                    "duration":2.0
                },
                {
                    "startDate":"2010-05-27T07:47:31",
                    "endDate":"2016-06-27T07:47:31",
                    "duration":1.0
                }
              ],
              "faReportAcceptedDateTime":"2016-06-27T07:47:31",
              "faReportDocumentType":"DECLARATION",
              "correction":false
          },
          {
              "faReportID":0,
              "activityType":"DEPARTURE",
              "occurence":"2016-06-27T07:47:31",
              "reason":"FISHING",
              "faReportAcceptedDateTime":"2016-06-27T07:47:31",
              "faReportDocumentType":"DECLARATION",
              "correction":false
          },
          {
              "faReportID":0,
              "activityType":"FISHING_OPERATION",
              "occurence":"2013-05-27T07:47:31",
              "reason":"FISHING",
              "fishingGears":[
                {
                    "gearTypeCode":"GEAR_TYPE"
                }
              ],
              "delimitedPeriod":[
                {
                    "startDate":"2010-05-27T07:47:31",
                    "endDate":"2016-06-27T07:47:31",
                    "duration":1.0
                }
              ],
              "faReportAcceptedDateTime":"2016-06-27T07:47:31",
              "faReportDocumentType":"DECLARATION",
              "correction":false
          }
        ]
    };

  beforeEach(function(){
      actRestSpy = jasmine.createSpyObj('activityRestService', ['getTripMessageCount']);
      
      module(function($provide){
          $provide.value('activityRestService', actRestSpy);
      });
  });

  beforeEach(inject(function($rootScope,$compile) {
    scope = $rootScope.$new();
    compile = $compile;
  }));

  beforeEach(inject(function($httpBackend) {
		//Mock
		$httpBackend.whenGET(/usm/).respond();
		$httpBackend.whenGET(/i18n/).respond();
		$httpBackend.whenGET(/globals/).respond({data : []});
	}));

	beforeEach(inject(function(Trip) {
    scope.trip = new Trip('NOR-TRP-20160517234053706');

    scope.trip.fromJson('reports',reportsData);

		if(!angular.element('#parent-container').length){
			var parentElement = angular.element('<div id="parent-container"></div>');
			parentElement.appendTo('body');
		}
	}));

    function getTripMessageCount(){
      return {
        data:{
          noOfReports: 1,
          noOfDeclarations: 0,
          noOfNotifications: 2,
          noOfCorrections: 5,
          noOfFishingOperations: 2,
          noOfDeletions: 0,
          noOfCancellations: 1
        },
        code:200
      };
    } 

    function buildMocks(){
        actRestSpy.getTripMessageCount.andCallFake(function(){
            return {
                then: function(callback){
                    return callback(getTripMessageCount());
                }
            };
        });
    }

	it('should show the reports data', function() {
    buildMocks();
		var tripReportsPanel = compile('<trip-reports-panel trip="trip"></trip-reports-panel>')(scope);
		scope.$digest();

    tripReportsPanel.appendTo('#parent-container');
		expect(angular.element('.trip-reports-section').length).toEqual(1);


    expect(angular.element('.angular-ui-tree-nodes > .angular-ui-tree-node').length).toEqual(scope.trip.reports.length);


    angular.element('trip-reports-panel').remove();
		tripReportsPanel.isolateScope().$destroy();
	});

});
