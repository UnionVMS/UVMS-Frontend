describe('VesselModel', function() {

  beforeEach(module('unionvmsWeb'));

    var vesselData = {
        "vesselId": {
            "type": "GUID",
            "value": "584f9a8e-d53a-448a-8b21-866f2a492987"
        },
        "active": true,
        "source": "LOCAL",
        "eventHistory": {
            "eventId": "50c884e8-f03d-4222-841b-6ad1f2263694",
            "eventCode": "MOD",
            "eventDate": 1434924000000
        },
        "name": "Gustavs test",
        "countryCode": null,
        "vesselType": null,
        "hasIrcs": false,
        "ircs": "2342234",
        "externalMarking": null,
        "cfr": "dsfsdf",
        "imo": "345345",
        "mmsiNo": "3456745",
        "billing": "fdfg",
        "hasLicense": "true",
        "homePort": "GOT",
        "lengthOverAll": 345,
        "lengthBetweenPerpendiculars": 845.234,
        "grossTonnage": 34.34,
        "otherGrossTonnage": 546.345,
        "safetyGrossTonnage": 435.234,
        "powerMain": 456.234,
        "powerAux": 234.2343
    };

    it('create new should set correct values', inject(function(Vessel) {
        var vessel = new Vessel();

        expect(vessel.guid).toBeUndefined();
        expect(vessel.vesselId).toBeUndefined();
        expect(vessel.active).toEqual(true);
        expect(vessel.source).toEqual("LOCAL");
    }));

    it("should parse JSON correctly", inject(function(Vessel) {
        var vessel = Vessel.fromJson(vesselData);

        expect(vessel.eventHistory).toBeDefined();

        expect(vessel.vesselId.value).toEqual(vesselData.vesselId.value);
        expect(vessel.vesselId.type).toEqual(vesselData.vesselId.type);

        expect(vessel.source).toEqual(vesselData.source);
        expect(vessel.active).toEqual(vesselData.active);
        expect(vessel.billing).toEqual(vesselData.billing);
        expect(vessel.cfr).toEqual(vesselData.cfr);
        expect(vessel.countryCode).toEqual(vesselData.countryCode);
        
        expect(vessel.externalMarking).toEqual(vesselData.externalMarking);
        expect(vessel.grossTonnage).toEqual(vesselData.grossTonnage);
        expect(vessel.hasIrcs).toEqual(vesselData.hasIrcs);
        expect(vessel.hasLicense).toEqual(vesselData.hasLicense);
        expect(vessel.homePort).toEqual(vesselData.homePort);
        expect(vessel.imo).toEqual(vesselData.imo);
        expect(vessel.ircs).toEqual(vesselData.ircs);

        expect(vessel.lengthBetweenPerpendiculars).toEqual(vesselData.lengthBetweenPerpendiculars);
        expect(vessel.lengthOverAll).toEqual(vesselData.lengthOverAll);
        expect(vessel.mmsiNo).toEqual(vesselData.mmsiNo);
        expect(vessel.name).toEqual(vesselData.name);
        expect(vessel.otherGrossTonnage).toEqual(vesselData.otherGrossTonnage);
        expect(vessel.powerAux).toEqual(vesselData.powerAux);
        expect(vessel.powerMain).toEqual(vesselData.powerMain);
        expect(vessel.safetyGrossTonnage).toEqual(vesselData.safetyGrossTonnage);
        expect(vessel.vesselType).toEqual(vesselData.vesselType);

    }));

    it("copy should create an identical object", inject(function(Vessel) {
        var origVessel = Vessel.fromJson(vesselData);
        var vesselCopy = origVessel.copy();

        expect(vesselCopy.eventHistory).toBeDefined();

        expect(vesselCopy.vesselId.value).toEqual(origVessel.vesselId.value);
        expect(vesselCopy.vesselId.type).toEqual(origVessel.vesselId.type);

        expect(vesselCopy.source).toEqual(origVessel.source);
        expect(vesselCopy.active).toEqual(origVessel.active);
        expect(vesselCopy.billing).toEqual(origVessel.billing);
        expect(vesselCopy.cfr).toEqual(origVessel.cfr);
        expect(vesselCopy.countryCode).toEqual(origVessel.countryCode);
        
        expect(vesselCopy.externalMarking).toEqual(origVessel.externalMarking);
        expect(vesselCopy.grossTonnage).toEqual(origVessel.grossTonnage);
        expect(vesselCopy.hasIrcs).toEqual(origVessel.hasIrcs);
        expect(vesselCopy.hasLicense).toEqual(origVessel.hasLicense);
        expect(vesselCopy.homePort).toEqual(origVessel.homePort);
        expect(vesselCopy.imo).toEqual(origVessel.imo);
        expect(vesselCopy.ircs).toEqual(origVessel.ircs);

        expect(vesselCopy.lengthBetweenPerpendiculars).toEqual(origVessel.lengthBetweenPerpendiculars);
        expect(vesselCopy.lengthOverAll).toEqual(origVessel.lengthOverAll);
        expect(vesselCopy.mmsiNo).toEqual(origVessel.mmsiNo);
        expect(vesselCopy.name).toEqual(origVessel.name);
        expect(vesselCopy.otherGrossTonnage).toEqual(origVessel.otherGrossTonnage);
        expect(vesselCopy.powerAux).toEqual(origVessel.powerAux);
        expect(vesselCopy.powerMain).toEqual(origVessel.powerMain);
        expect(vesselCopy.safetyGrossTonnage).toEqual(origVessel.safetyGrossTonnage);
        expect(vesselCopy.vesselType).toEqual(origVessel.vesselType);

    }));
      
});
