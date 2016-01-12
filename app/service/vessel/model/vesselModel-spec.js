describe('VesselModel', function() {

  beforeEach(module('unionvmsWeb'));

    var vesselData = {
        "assetId": {
            "guid" : "50c884e8-f03d-4222-841b-6ad1f2263694",
            "type": "GUID",
            "value": "584f9a8e-d53a-448a-8b21-866f2a492987"
        },
        "active": true,
        "source": "INTERNAL",
        "eventHistory": {
            "eventId": "50c884e8-f03d-4222-841b-6ad1f2263694",
            "eventCode": "MOD",
            "eventDate": 1434924000000
        },
        "name": "Gustavs test",
        "countryCode": "SWE",
        "gearType": "TEST_TYPE",
        "hasIrcs": "Y",
        "ircs": "2342234",
        "hasLicense": true,
        "licenseType": "TEST_LICENSE",
        "externalMarking": "Ext",
        "cfr": "dsfsdf",
        "imo": "345345",
        "mmsiNo": "3456745",
        "homePort": "GOT",
        "lengthOverAll": 345,
        "lengthBetweenPerpendiculars": null,
        "grossTonnage": 34.34,
        "grossTonnageUnit": "LONDON",
        "powerMain": 456.234,
        "notes" : "Test ship",
        "contact" : {
            "name" : "Test Test",
            "email" : "test@test.com",
            "number" : "057623234",
        },
        "producer" : {
            "code" : "123AB",
            "name" : "ProducerName"
        },
    };

    it('create new should set correct values', inject(function(Vessel) {
        var vessel = new Vessel();

        expect(vessel.guid).toBeUndefined();
        expect(vessel.vesselId).toBeUndefined();
        expect(vessel.active).toEqual(true);
        expect(vessel.source).toEqual("INTERNAL");
        expect(vessel.notes).toEqual("");
    }));

    it("should parse JSON correctly", inject(function(Vessel) {
        var vessel = Vessel.fromJson(vesselData);

        expect(vessel.eventHistory).toBeDefined();
        expect(vessel.notes).toEqual(vesselData.notes);

        expect(vessel.vesselId.guid).toEqual(vesselData.assetId.guid);
        expect(vessel.vesselId.value).toEqual(vesselData.assetId.value);
        expect(vessel.vesselId.type).toEqual(vesselData.assetId.type);

        expect(vessel.source).toEqual(vesselData.source);
        expect(vessel.active).toEqual(vesselData.active);
        expect(vessel.countryCode).toEqual(vesselData.countryCode);
        expect(vessel.name).toEqual(vesselData.name);
        expect(vessel.cfr).toEqual(vesselData.cfr);
        expect(vessel.imo).toEqual(vesselData.imo);
        expect(vessel.mmsiNo).toEqual(vesselData.mmsiNo);
        expect(vessel.externalMarking).toEqual(vesselData.externalMarking);

        expect(vessel.hasIrcs()).toEqual(vesselData.hasIrcs);
        expect(vessel.ircs).toEqual(vesselData.ircs);
        expect(vessel.hasLicense()).toEqual(vesselData.hasLicense);
        expect(vessel.licenseType).toEqual(vesselData.licenseType);
        expect(vessel.homePort).toEqual(vesselData.homePort);

        expect(vessel.lengthOverAll).toBeUndefined();
        expect(vessel.lengthBetweenPerpendiculars).toBeUndefined();
        expect(vessel.lengthValue).toEqual(vesselData.lengthOverAll);
        expect(vessel.lengthType).toEqual('LOA');
        expect(vessel.grossTonnage).toEqual(vesselData.grossTonnage);
        expect(vessel.grossTonnageUnit).toEqual(vesselData.grossTonnageUnit);
        expect(vessel.powerMain).toEqual(vesselData.powerMain);
        expect(vessel.gearType).toEqual(vesselData.gearType);

        expect(vessel.contact.name).toEqual(vesselData.contact.name);
        expect(vessel.contact.email).toEqual(vesselData.contact.email);
        expect(vessel.contact.number).toEqual(vesselData.contact.number);
        expect(vessel.producer.code).toEqual(vesselData.producer.code);
        expect(vessel.producer.name).toEqual(vesselData.producer.name);

    }));

    it("copy should create an identical object", inject(function(Vessel) {
        var origVessel = Vessel.fromJson(vesselData);
        var vesselCopy = origVessel.copy();

        expect(vesselCopy.eventHistory).toBeDefined();
        expect(vesselCopy.notes).toEqual(origVessel.notes);

        expect(vesselCopy.vesselId.guid).toEqual(origVessel.vesselId.guid);
        expect(vesselCopy.vesselId.value).toEqual(origVessel.vesselId.value);
        expect(vesselCopy.vesselId.type).toEqual(origVessel.vesselId.type);

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

        expect(vesselCopy.contact.name).toEqual(origVessel.contact.name);
        expect(vesselCopy.contact.email).toEqual(origVessel.contact.email);
        expect(vesselCopy.contact.number).toEqual(origVessel.contact.number);
        expect(vesselCopy.producer.code).toEqual(origVessel.producer.code);
        expect(vesselCopy.producer.name).toEqual(origVessel.producer.name);


    }));

    it("getGuid should return the vessel guid", inject(function(Vessel) {
        var vessel = Vessel.fromJson(vesselData);
        expect(vessel.getGuid()).toEqual(vesselData.assetId.guid);

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
        vessel2.vesselId.guid = "CHANGED";
        expect(vessel.equals(vessel2)).toEqual(false);
    }));


    it("hasIrcs() should return Y or N depending on Ircs value", inject(function(Vessel) {
        var vessel = Vessel.fromJson(vesselData);

        vessel.ircs = "TEST";
        expect(vessel.hasIrcs()).toEqual('Y');

        vessel.ircs = "";
        expect(vessel.hasIrcs()).toEqual('N');

        vessel.ircs = undefined;
        expect(vessel.hasIrcs()).toEqual('N');
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
