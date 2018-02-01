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

    var scope,ctrl, mockSubRestServ, stateParams;

    beforeEach(function () {
        mockSubRestServ = jasmine.createSpyObj('subscriptionsRestService', ['createSubscription', 'updateSubscription']);

        module(function ($provide) {
            $provide.value('subscriptionsRestService', mockSubRestServ);
        })
    });

    beforeEach(inject(function($httpBackend) {
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    function buildMockSubscription(){
        return {
            "name": "Test",
            "isActive": true,
            "organisation": 1,
            "endPoint": 1,
            "communicationChannel": 1,
            "subscriptionType": "TX_PUSH",
            "accessibility": "PRIVATE",
            "description": "test",
            "startDate": "2018-01-01T08:18:41",
            "endDate": "2018-01-31T08:18:41",
            "delay": "1,2",
            "messageType": "FLUX_FA_REPORT_MESSAGE",
            "triggerType": "MANUAL",
            "conditions": [],
            "areas": []
        }
    }

    function buildRestMocks (){
        mockSubRestServ.createSubscription.andCallFake(function () {
            return {
                then: function (callback) {
                    callback({
                        code: 200,
                        data: buildMockSubscription()
                    })
                }
            }
        });

        mockSubRestServ.updateSubscription.andCallFake(function () {
            return {
                then: function (callback) {
                    callback({
                        code: 200,
                        data: buildMockSubscription()
                    })
                }
            }
        });
    }

    describe('Testing NewsubscriptionCtrl while creating a new subscription', function () {
        beforeEach(inject(function($rootScope, $controller) {
            scope = $rootScope.$new();
            ctrl = $controller('NewsubscriptionCtrl', {$scope: scope});

            scope.subServ.layoutStatus.isNewSub = true;
            buildRestMocks();
        }));

        it('should properly initialize the new subscription partial', inject(function() {
            expect(scope.isSubmitting).toBeFalsy();
            expect(scope.subscription).toBeDefined();
            expect(scope.subscription.name).toBeUndefined();
            expect(scope.subServ.layoutStatus.isForm).toBeTruthy();
        }));

        it('should save a new subscription', function () {
            scope.subscription = scope.subscription.fromJson(buildMockSubscription());
            scope.subscriptionForm = {
                $valid: true
            };
            scope.saveSubscription();

            expect(mockSubRestServ.createSubscription).toHaveBeenCalledWith(scope.subscription.toJson(scope.subscription));
            expect(scope.subServ.layoutStatus.isNewSub).toBeFalsy();
            expect(scope.subServ.alertStatus.type).toEqual('success');
        });

        it('should throw an error if no endpoint is defined', function () {
            scope.subscription = scope.subscription.fromJson(buildMockSubscription());
            scope.subscription.endPoint = undefined;
            scope.subscriptionForm = {
                $valid: true
            };
            scope.saveSubscription();

            expect(mockSubRestServ.createSubscription).not.toHaveBeenCalled();
            expect(scope.subServ.alertStatus.type).toEqual('error');
        });

        it('should throw an error if no communication channel is defined', function () {
            scope.subscription = scope.subscription.fromJson(buildMockSubscription());
            scope.subscription.communicationChannel = undefined;
            scope.subscriptionForm = {
                $valid: true
            };
            scope.saveSubscription();

            expect(mockSubRestServ.createSubscription).not.toHaveBeenCalled();
            expect(scope.subServ.alertStatus.type).toEqual('error');
        });
    });

    describe('Testing NewsubscriptionCtrl while editing an existing subscription', function () {
        beforeEach(inject(function($rootScope, $controller, Subscription) {
            var sub = new Subscription();
            scope = $rootScope.$new();
            ctrl = $controller('NewsubscriptionCtrl', {
                $scope: scope,
                $stateParams: {
                    subToEdit: sub.fromJson(buildMockSubscription())
                }
            });
            scope.subServ.layoutStatus.isNewSub = false;
            buildRestMocks();
        }));

        it('should properly initalize the edit subscription partial', function () {
            expect(scope.isSubmitting).toBeFalsy();
            expect(scope.subscription).toBeDefined();
            expect(scope.subscription.name).toEqual('Test');
            expect(scope.subServ.layoutStatus.isForm).toBeTruthy();
        });

        it('should update a subscription', function () {
            scope.subscriptionForm = {
                $valid: true
            };
            scope.subscription.name = 'Test 2';
            scope.saveSubscription();

            expect(mockSubRestServ.updateSubscription).toHaveBeenCalledWith(scope.subscription.toJson(scope.subscription));
            expect(scope.subServ.layoutStatus.isNewSub).toBeFalsy();
            expect(scope.subServ.alertStatus.type).toEqual('success');
        });
    });
});