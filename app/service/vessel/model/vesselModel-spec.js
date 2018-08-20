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
describe('VesselModel', function() {

  beforeEach(module('unionvmsWeb'));

    var vesselData = {
    	"id" : "50c884e8-f03d-4222-841b-6ad1f2263694",
    	"historyId": "50c884e8-f03d-4222-841b-6ad1f2263694",
        "active": true,
        "source": "INTERNAL",
        "name": "Gustavs test",
        "flagStateCode": "SWE",
        "gearType": "TEST_TYPE",
        "ircs": "2342234",
        "hasLicense": true,
        "licenseType": "TEST_LICENSE",
        "externalMarking": "Ext",
        "cfr": "dsfsdf",
        "imo": "345345",
        "mmsi": "3456745",
        "portOfRegistration": "GOT",
        "lengthOverAll": 345,
        "lengthBetweenPerpendiculars": null,
        "grossTonnage": 34.34,
        "grossTonnageUnit": "LONDON",
        "powerOfMainEngine": 456.234,
//        "notes" : [
//          {
//            "date": "2016-06-29T08:55:27.795+02:00",
//            "activity": "V02",
//            "user": "ANTFON",
//            "licenseHolder": "170322-1224",
//            "notes": "SEJ 2016-07-17 07:10 11 59 33,40 / 12 21,56\\nsvar på mail fr landkontrollen (Apa Kanin) fartyget ligger vid kaj",
//            "source": "NATIONAL"
//          },
//            {
//              "date": "2016-03-29T08:55:27.795+02:00",
//              "activity": "V02",
//              "user": "VMS_ADMIN_COM",
//              "readyDate": "2016-03-30T18:55:27.795+02:00",
//              "licenseHolder": "781012-1234",
//              "contact": "sten@sture",
//              "sheetNumber": "XYZ-123",
//              "notes": "Hej hej",
//              "document": "how will this work, I wonder?",
//              "source": "INTERNAL"
//            }
//          ],
//        "contact" : [{
//             "name": "Apan",
//             "number": "0701111111",
//             "email": "apa@skogen",
//             "owner": true,
//             "source": "INTERNAL"
//           },
//           {
//             "name": "Kaninen",
//             "number": "0701222222",
//             "email": "kanin@skogen",
//             "owner": false,
//             "source": "INTERNAL"
//           }
//           ],
//        "producer" : {
//            "id" : "123AB",
//            "code" : "ProducerCode",
//            "name" : "ProducerName",
//            "address" : "ProducerAddress",
//            "zipcode" : "ProducerZipcode",
//            "city" : "ProducerCity",
//            "phone" : "ProducerPhone",
//            "mobile" : "ProducerMobile",
//            "fax" : "ProducerFax"
//        },
    };

    it('create new should set correct values', inject(function(Vessel) {
        var vessel = new Vessel();

        expect(vessel.guid).toBeUndefined();
        expect(vessel.vesselId).toBeUndefined();
        expect(vessel.active).toEqual(true);
        expect(vessel.source).toEqual("INTERNAL");
        expect(vessel.notes).toEqual([]);
        expect(vessel.contact).toEqual([]);
    }));

    it("should parse JSON correctly", inject(function(Vessel) {
        var vessel = Vessel.fromJson(vesselData);

        expect(vessel.historyId).toEqual(vesselData.historyId);

        expect(vessel.id).toEqual(vesselData.id);

        expect(vessel.source).toEqual(vesselData.source);
        expect(vessel.active).toEqual(vesselData.active);
        expect(vessel.countryCode).toEqual(vesselData.flagStateCode);
        expect(vessel.name).toEqual(vesselData.name);
        expect(vessel.cfr).toEqual(vesselData.cfr);
        expect(vessel.imo).toEqual(vesselData.imo);
        expect(vessel.mmsiNo).toEqual(vesselData.mmsi);
        expect(vessel.externalMarking).toEqual(vesselData.externalMarking);

        expect(vessel.hasIrcs()).toEqual(true);
        expect(vessel.ircs).toEqual(vesselData.ircs);
        expect(vessel.hasLicense()).toEqual(vesselData.hasLicense);
        expect(vessel.licenseType).toEqual(vesselData.licenseType);
        expect(vessel.homePort).toEqual(vesselData.portOfRegistration);

        expect(vessel.lengthOverAll).toBeUndefined();
        expect(vessel.lengthBetweenPerpendiculars).toBeUndefined();
        expect(vessel.lengthValue).toEqual(vesselData.lengthOverAll);
        expect(vessel.lengthType).toEqual('LOA');
        expect(vessel.grossTonnage).toEqual(vesselData.grossTonnage);
        expect(vessel.grossTonnageUnit).toEqual(vesselData.grossTonnageUnit);
        expect(vessel.powerMain).toEqual(vesselData.powerOfMainEngine);
        expect(vessel.gearType).toEqual(vesselData.gearType);

//        expect(vessel.contact.length).toEqual(vesselData.contact.length);
//        expect(vessel.notes.length).toEqual(vesselData.notes.length);
//        expect(vessel.producer.id).toEqual(vesselData.producer.id);
//        expect(vessel.producer.code).toEqual(vesselData.producer.code);
//        expect(vessel.producer.name).toEqual(vesselData.producer.name);
//        expect(vessel.producer.address).toEqual(vesselData.producer.address);
//        expect(vessel.producer.zipcode).toEqual(vesselData.producer.zipcode);
//        expect(vessel.producer.city).toEqual(vesselData.producer.city);
//        expect(vessel.producer.phone).toEqual(vesselData.producer.phone);
//        expect(vessel.producer.mobile).toEqual(vesselData.producer.mobile);
//        expect(vessel.producer.fax).toEqual(vesselData.producer.fax);
    }));

    it("copy should create an identical object", inject(function(Vessel) {
        var origVessel = Vessel.fromJson(vesselData);
        var vesselCopy = origVessel.copy();

        expect(vesselCopy.historyId).toEqual(origVessel.historyId);

        expect(vesselCopy.id).toEqual(origVessel.id);

        expect(vesselCopy.source).toEqual(origVessel.source);
        expect(vesselCopy.active).toEqual(origVessel.active);
        expect(vesselCopy.countryCode).toEqual(origVessel.countryCode);
        expect(vesselCopy.name).toEqual(origVessel.name);
        expect(vesselCopy.cfr).toEqual(origVessel.cfr);
        expect(vesselCopy.imo).toEqual(origVessel.imo);
        expect(vesselCopy.mmsiNo).toEqual(origVessel.mmsiNo);
        expect(vesselCopy.externalMarking).toEqual(origVessel.externalMarking);

        expect(vesselCopy.hasIrcs).toEqual(origVessel.hasIrcs);
        expect(vesselCopy.ircs).toEqual(origVessel.ircs);
        expect(vesselCopy.hasLicense).toEqual(origVessel.hasLicense);
        expect(vesselCopy.licenseType).toEqual(origVessel.licenseType);
        expect(vesselCopy.homePort).toEqual(origVessel.homePort);

        expect(vesselCopy.lengthOverAll).toEqual(origVessel.lengthOverAll);
        expect(vesselCopy.lengthBetweenPerpendiculars).toEqual(origVessel.lengthBetweenPerpendiculars);
        expect(vesselCopy.grossTonnage).toEqual(origVessel.grossTonnage);
        expect(vesselCopy.grossTonnageUnit).toEqual(origVessel.grossTonnageUnit);
        expect(vesselCopy.powerMain).toEqual(origVessel.powerMain);
        expect(vesselCopy.gearType).toEqual(origVessel.gearType);

//        expect(vesselCopy.producer.code).toEqual(origVessel.producer.code);
//        expect(vesselCopy.producer.name).toEqual(origVessel.producer.name);


    }));

    it("getGuid should return the vessel guid", inject(function(Vessel) {
        var vessel = Vessel.fromJson(vesselData);
        expect(vessel.getGuid()).toEqual(vesselData.id);

        var newVessel = new Vessel();
        expect(newVessel.getGuid()).toBeUndefined();
    }));

    it("isLocalSource should return true only when source is INTERNAL", inject(function(Vessel) {
        var vessel = Vessel.fromJson(vesselData);
        expect(vessel.isLocalSource()).toEqual(true);

        vessel.source = "National";
        expect(vessel.isLocalSource()).toEqual(false);
    }));

    it("equals should return true when two vessels have the same guid", inject(function(Vessel) {
        var vessel = Vessel.fromJson(vesselData);
        var vessel2 = Vessel.fromJson(vesselData);
        expect(vessel.equals(vessel2)).toEqual(true);
    }));

    it("equals should return true when two vessels have the same guid even if values are different", inject(function(Vessel) {
        var vessel = Vessel.fromJson(vesselData);
        var vessel2 = Vessel.fromJson(vesselData);
        vessel2.ircs = "CHANGED";
        expect(vessel.equals(vessel2)).toEqual(true);
    }));

    it("equals should return false when two vessels have different guids", inject(function(Vessel) {
        var vessel = Vessel.fromJson(vesselData);
        var vessel2 = Vessel.fromJson(vesselData);
        vessel2.id = "CHANGED";
        expect(vessel.equals(vessel2)).toEqual(false);
    }));


    it("hasIrcs() should return Y or N depending on Ircs value", inject(function(Vessel) {
        var vessel = Vessel.fromJson(vesselData);

        vessel.ircs = "TEST";
        expect(vessel.hasIrcs()).toEqual(true);

        vessel.ircs = "";
        expect(vessel.hasIrcs()).toEqual(false);

        vessel.ircs = undefined;
        expect(vessel.hasIrcs()).toEqual(false);
    }));

    it("hasLicense() should return true if licenseType is set", inject(function(Vessel) {
        var vessel = Vessel.fromJson(vesselData);

        vessel.licenseType = "TEST";
        expect(vessel.hasLicense()).toBeTruthy();

        vessel.licenseType = "";
        expect(vessel.hasLicense()).toBeFalsy();

        vessel.licenseType = undefined;
        expect(vessel.hasLicense()).toBeFalsy();
    }));


});
