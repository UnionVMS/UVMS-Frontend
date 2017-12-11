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
describe('NewsubscriptionCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl,subscriptionsRestSpy;
	
	beforeEach(function(){
        subscriptionsRestSpy = jasmine.createSpyObj('subscriptionsRestService', ['getFormDetails', 'getFormComboDetails']);
        
        module(function($provide){
            $provide.value('subscriptionsRestService', subscriptionsRestSpy);
        });
	});
	
	function getFormDetails() {
		return {
			name: "meera",
			isActive: true,
			organization: "organization1",
			subscriptionType: "Tx-Push",
			endPoint: "end Point4",
			commChannel: "Flux",
			messageType: "Message type",
			accessibility: "accessibility",
			retryDelay: "Retry Delay",
			description: "I need subscription",
			queryParams: {
				vesselId: "vessel ID 1",
				includeCorrectionHist: true, 
				time: 5,
				timeUnit: "hours"
			}
		};
	}
	function getFormComboDetails() {
		return {
			organization: [{
				"text": "organization1",
				"code": "organization1"
			}, {
				"text": "organization2",
				"code": "organization2"
			},
			{
				"text": "organization3",
				"code": "organization3"
			},
			{
				"text": "organization4",
				"code": "organization4"
			}
			],
			subscriptionType: [{
				"text": "Tx-Push",
				"code": "Tx-Push"
			}, {
				"text": "Tx-Pull",
				"code": "Tx-Pull"
			}
			],
			endPoint: [{
				"text": "end Point1",
				"code": "end Point1"
			}, {
				"text": "end Point2",
				"code": "end Point2"
			}, {
				"text": "end Point3",
				"code": "end Point3"
			}, {
				"text": "end Point4",
				"code": "end Point4"
			}],
			accessibility: [{
				"text": "accessibility",
				"code": "accessibility"
			}, {
				"text": "accessibility1",
				"code": "accessibility1"
			}, {
				"text": "accessibility2",
				"code": "accessibility2"
			}, {
				"text": "accessibility3",
				"code": "accessibility3"
			}],
			commChannel: [{
				"text": "Manual",
				"code": "Manual"
			}, {
				"text": "Flux",
				"code": "Flux"
			}],
			messageType: [{
				"text": "Message type",
				"code": "Message type"
			}, {
				"text": "Message type1",
				"code": "Message type1"
			}]


		};
	}

	function buildMocks() {
        subscriptionsRestSpy.getFormDetails.andCallFake(function(){
            return {
                then: function(callback){
                    return callback(getFormDetails());
                }
            }   
		});
		subscriptionsRestSpy.getFormComboDetails.andCallFake(function(){
            return {
                then: function(callback){
                    return callback(getFormDetails());
                }
            }   
		});
	}
	
	beforeEach(inject(function($rootScope, $httpBackend,  $controller, $injector) {
		$httpBackend = $injector.get('$httpBackend');
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({ data: [] });

        buildMocks();
        scope = $rootScope.$new();
        ctrl = $controller('NewsubscriptionCtrl', { $scope: scope });
	}));
		

	it('should call getFormDetails', inject(function() { 
		scope.$digest();
		expect(scope.subService.getFormDetails.callCount).toBe(1);
	}));
	it('should call getFormComboDetails', inject(function() { 
		scope.$digest();
		expect(scope.subService.getFormComboDetails.callCount).toBe(1);
	}));
	
});