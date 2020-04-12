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
describe('Subscription', function() {

    beforeEach(module('unionvmsWeb'));

    function getSubscriptionData(){
        return {
            "id": 100,
            "subscriptionType": "TX_PUSH",
            "messageType": "FLUX_FA_REPORT_MESSAGE",
            "conditions": [],
            "areas": [],
            "name": "Test 1",
            "guid": "400878ad-a4ca-4761-a82f-0d0d55782292",
            "accessibility": "PUBLIC",
            "description": "Test active",
            "startDate": "2018-01-01T15:31:43",
            "endDate": "2019-01-17T15:31:43",
            "organisation": "1",
            "endPoint": "100002",
            "triggerType": "MANUAL",
            "delay": "1,2",
            "stateType": "INACTIVE",
            "isActive": true,
            "communicationChannel": "100008"
        }
    }

    it('should instantiate a new empty subscription object', inject(function(Subscription){
        var sub = new Subscription();

        expect(sub).toEqual(jasmine.any(Object));
        expect(sub.isActive).toBeFalsy();
        expect(sub.subscriptionType).toEqual('TX_PUSH');
        expect(sub.accessibility).toEqual('PUBLIC');
        expect(sub.messageType).toEqual('FLUX_FA_REPORT_MESSAGE');
        expect(sub.triggerType).toEqual('MANUAL');
        expect(sub.conditions).toEqual(jasmine.any(Array));
        expect(sub.areas).toEqual(jasmine.any(Array));
    }));

    it('should instantiate a new empty subscription object for search', inject(function(Subscription){
        var sub = new Subscription(true);

        expect(sub).toEqual(jasmine.any(Object));
        expect(sub.isActive).toEqual('all');
        expect(sub.subscriptionType).toBeUndefined();
        expect(sub.accessibility).toBeUndefined();
        expect(sub.messageType).toBeUndefined();
        expect(sub.triggerType).toBeUndefined();
        expect(sub.conditions).toBeUndefined();
        expect(sub.areas).toBeUndefined();
    }));

    it('should properly build a subscription from json data', inject(function (Subscription) {
        var data = getSubscriptionData();
        var sub = new Subscription();
        sub = sub.fromJson(data);

        expect(sub.id).toEqual(100);
        expect(sub.subscriptionType).toEqual(data.subscriptionType);
        expect(sub.messageType).toEqual(data.messageType);
        //expect(sub.conditions).toEqual(jasmine.any(Array));
        //expect(sub.areas).toEqual(jasmine.any(Array));
        expect(sub.name).toEqual(data.name);
        expect(sub.guid).toEqual(data.guid);
        expect(sub.accessibility).toEqual(data.accessibility);
        expect(sub.description).toEqual(data.description);
        expect(sub.startDate).toBeDefined();
        expect(sub.endDate).toBeDefined();
        expect(sub.organisation).toEqual(parseInt(data.organisation));
        expect(sub.endPoint).toEqual(parseInt(data.endPoint));
        expect(sub.triggerType).toEqual(data.triggerType);
        expect(sub.delay).toEqual(data.delay);
        expect(sub.stateType).toBeUndefined();
        expect(sub.isActive).toEqual(data.isActive);
        expect(sub.communicationChannel).toEqual(parseInt(data.communicationChannel));
    }));
});
