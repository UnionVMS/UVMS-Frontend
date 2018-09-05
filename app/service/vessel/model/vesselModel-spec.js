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
        "gearFishingType": "TEST_TYPE",
        "ircs": "2342234",
        "hasLicense": true,
        "licenceType": "TEST_LICENSE",
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
    };

    it('create new should set correct values', inject(function(Vessel) {
        var vessel = new Vessel();

        expect(vessel.id).toBeUndefined();
        expect(vessel.historyId).toBeUndefined();
        expect(vessel.active).toEqual(true);
        expect(vessel.source).toEqual("INTERNAL");
    }));

    it("should parse JSON correctly", inject(function(Vessel) {
        var vessel = Vessel.fromJson(vesselData);

        expect(vessel.historyId).toEqual(vesselData.historyId);

        expect(vessel.id).toEqual(vesselData.id);

        expect(vessel.source).toEqual(vesselData.source);
        expect(vessel.active).toEqual(vesselData.active);
        expect(vessel.flagStateCode).toEqual(vesselData.flagStateCode);
        expect(vessel.name).toEqual(vesselData.name);
        expect(vessel.cfr).toEqual(vesselData.cfr);
        expect(vessel.imo).toEqual(vesselData.imo);
        expect(vessel.mmsi).toEqual(vesselData.mmsi);
        expect(vessel.externalMarking).toEqual(vesselData.externalMarking);

        expect(vessel.hasIrcs()).toEqual(true);
        expect(vessel.ircs).toEqual(vesselData.ircs);
        expect(vessel.hasLicense()).toEqual(vesselData.hasLicense);
        expect(vessel.licenseType).toEqual(vesselData.licenceType);
        expect(vessel.portOfRegistration).toEqual(vesselData.portOfRegistration);

        expect(vessel.lengthOverAll).toBeUndefined();
        expect(vessel.lengthBetweenPerpendiculars).toBeUndefined();
        expect(vessel.lengthValue).toEqual(vesselData.lengthOverAll);
        expect(vessel.lengthType).toEqual('LOA');
        expect(vessel.grossTonnage).toEqual(vesselData.grossTonnage);
        expect(vessel.grossTonnageUnit).toEqual(vesselData.grossTonnageUnit);
        expect(vessel.powerMain).toEqual(vesselData.powerOfMainEngine);
        expect(vessel.gearFishingType).toEqual(vesselData.gearFishingType);

    }));

    it("copy should create an identical object", inject(function(Vessel) {
        var origVessel = Vessel.fromJson(vesselData);
        var vesselCopy = origVessel.copy();

        expect(vesselCopy.historyId).toEqual(origVessel.historyId);

        expect(vesselCopy.id).toEqual(origVessel.id);

        expect(vesselCopy.source).toEqual(origVessel.source);
        expect(vesselCopy.active).toEqual(origVessel.active);
        expect(vesselCopy.flagStateCode).toEqual(origVessel.flagStateCode);
        expect(vesselCopy.name).toEqual(origVessel.name);
        expect(vesselCopy.cfr).toEqual(origVessel.cfr);
        expect(vesselCopy.imo).toEqual(origVessel.imo);
        expect(vesselCopy.mmsi).toEqual(origVessel.mmsi);
        expect(vesselCopy.externalMarking).toEqual(origVessel.externalMarking);

        expect(vesselCopy.hasIrcs).toEqual(origVessel.hasIrcs);
        expect(vesselCopy.ircs).toEqual(origVessel.ircs);
        expect(vesselCopy.hasLicense).toEqual(origVessel.hasLicense);
        expect(vesselCopy.licenseType).toEqual(origVessel.licenseType);
        expect(vesselCopy.portOfRegistration).toEqual(origVessel.portOfRegistration);

        expect(vesselCopy.lengthOverAll).toEqual(origVessel.lengthOverAll);
        expect(vesselCopy.lengthBetweenPerpendiculars).toEqual(origVessel.lengthBetweenPerpendiculars);
        expect(vesselCopy.grossTonnage).toEqual(origVessel.grossTonnage);
        expect(vesselCopy.grossTonnageUnit).toEqual(origVessel.grossTonnageUnit);
        expect(vesselCopy.powerMain).toEqual(origVessel.powerMain);
        expect(vesselCopy.gearFishingType).toEqual(origVessel.gearFishingType);


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
