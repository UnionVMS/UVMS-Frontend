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
describe('MobileTerminalModel', function() {

  beforeEach(module('unionvmsWeb'));

    var mobileTerminalData = {
        "attributes": [
            {
                "type": "TRANSCEIVER_TYPE",
                "value": "Sailor 6140"
            },
            {
                "type": "SERIAL_NUMBER",
                "value": "4TT097411A33"
            },
            {
                "type": "SOFTWARE_VERSION",
                "value": "1.3-6"
            },
            {
                "type": "ANTENNA",
                "value": "Sailor 640"
            },
            {
                "type": "ANTENNA_SERIAL_NUMBER",
                "value": "12345"
            },
            {
                "type": "SATELLITE_NUMBER",
                "value": "426 572 212"
            },
            {
                "type": "MULTIPLE_OCEAN",
                "value": "581"
            },
            {
                "type": "MULTIPLE_OCEAN",
                "value": "582"
            }
        ],
        "connectId": "ebeec8ef-2eab-4d4f-9d6d-994ad8b57c34",
        "channels": [
            {
                "attributes": [
                    {
                        "type": "DNID",
                        "value": "11456"
                    },
                    {
                        "type": "MEMBER_NUMBER",
                        "value": "101"
                    },
                    {
                        "type": "START_DATE",
                        "value": "2015-01-01 09:00"
                    },
                    {
                        "type": "STOP_DATE",
                        "value": "2015-05-21 21:00"
                    }
                ],
                "capabilities": [
                    {
                        "type": "POLLABLE",
                        "value": true
                    },
                    {
                        "type": "CONFIGURABLE",
                        "value": false
                    }
                ],
                "defaultReporting": true,
                "name": "VMS"
            },
            {
                "attributes": [
                    {
                        "type": "DNID",
                        "value": "11456"
                    },
                    {
                        "type": "MEMBER_NUMBER",
                        "value": "102"
                    },
                    {
                        "type": "START_DATE",
                        "value": "2015-02-01 09:00"
                    },
                    {
                        "type": "STOP_DATE",
                        "value": "2015-06-21 21:00"
                    }
                ],
                "capabilities": [
                    {
                        "type": "POLLABLE",
                        "value": false
                    },
                    {
                        "type": "CONFIGURABLE",
                        "value": true
                    }
                ],
                "defaultReporting": false,
                "name": "HAV"
            }
        ],
        "inactive": false,
        "mobileTerminalId": {
            "guid": "1234-5678-9012-3456-7891-2345-678901"
        },
        "source": "INTERNAL",
        "type": "INMARSAT_C",
        "plugin" : {
            "labelName" : "BURUM",
            "serviceName" : "TestName",
            "inactive" : false
        }

    };

    it('create new should set correct values', inject(function(MobileTerminal) {
        var mobileTerminal = new MobileTerminal();

        expect(mobileTerminal.guid).toBeUndefined();
        expect(mobileTerminal.connectId).toBeUndefined();
        expect(mobileTerminal.plugin).toBeDefined();
        expect(Object.keys(mobileTerminal.attributes).length).toEqual(0);
        expect(mobileTerminal.channels.length).toEqual(1);
        expect(mobileTerminal.active).toEqual(false);
    }));

    it("should parse JSON correctly", inject(function(MobileTerminal) {
        var mt = MobileTerminal.fromJson(mobileTerminalData);

        expect(mt.guid).toBe("1234-5678-9012-3456-7891-2345-678901");
        expect(mt.source).toBe("INTERNAL");
        expect(mt.type).toBe("INMARSAT_C");
        expect(mt.active).toBe(true);

        expect(mt.plugin.labelName).toBe("BURUM");
        expect(mt.plugin.serviceName).toBe("TestName");
        expect(mt.plugin.inactive).toBe(false);
        expect(mt.connectId).toBe("ebeec8ef-2eab-4d4f-9d6d-994ad8b57c34");

        // Check that all attributes were parsed.
        expect(mt.attributes.TRANSCEIVER_TYPE).toBe("Sailor 6140");
        expect(mt.attributes.SERIAL_NUMBER).toBe("4TT097411A33");
        expect(mt.attributes.SOFTWARE_VERSION).toBe("1.3-6");
        expect(mt.attributes.ANTENNA).toBe("Sailor 640");
        expect(mt.attributes.ANTENNA_SERIAL_NUMBER).toBe("12345");
        expect(mt.attributes.SATELLITE_NUMBER).toBe("426 572 212");
        expect(mt.attributes.MULTIPLE_OCEAN.length).toBe(2);
        expect(mt.attributes.MULTIPLE_OCEAN[0]).toBe("581");
        expect(mt.attributes.MULTIPLE_OCEAN[1]).toBe("582");

        // Check that all channels were parsed.
        expect(mt.channels.length).toBe(2);
        expect(mt.channels[0].name).toBe("VMS");
        expect(mt.channels[0].defaultReporting).toBe(true);
        expect(mt.channels[0].ids.DNID).toBe("11456");
        expect(mt.channels[0].ids.MEMBER_NUMBER).toBe("101");
        expect(mt.channels[0].ids.START_DATE).toBe("2015-01-01 09:00");
        expect(mt.channels[0].ids.STOP_DATE).toBe("2015-05-21 21:00");
        expect(mt.channels[0].capabilities.POLLABLE).toBe(true);
        expect(mt.channels[0].capabilities.CONFIGURABLE).toBe(false);

        expect(mt.channels[1].name).toBe("HAV");
        expect(mt.channels[1].defaultReporting).toBe(false);
        expect(mt.channels[1].ids.DNID).toBe("11456");
        expect(mt.channels[1].ids.MEMBER_NUMBER).toBe("102");
        expect(mt.channels[1].ids.START_DATE).toBe("2015-02-01 09:00");
        expect(mt.channels[1].ids.STOP_DATE).toBe("2015-06-21 21:00");
        expect(mt.channels[1].capabilities.POLLABLE).toBe(false);
        expect(mt.channels[1].capabilities.CONFIGURABLE).toBe(true);
    }));

    it('should produce a transfer object containing attributes, channels and mobile terminal ID', inject(function(MobileTerminal) {
        var dto = MobileTerminal.fromJson(mobileTerminalData).dataTransferObject();

        expect(angular.equals(dto.mobileTerminalId, mobileTerminalData.mobileTerminalId)).toBeTruthy();
        expect(angular.equals(dto.channels, mobileTerminalData.channels)).toBeTruthy();
        expect(angular.equals(dto.attributes, mobileTerminalData.attributes)).toBeTruthy();
        expect(angular.equals(dto.plugin, mobileTerminalData.plugin)).toBeTruthy();
    }));

    it('should produce a carrier assignment/unassignment data transfer object', inject(function(MobileTerminal) {
        var mobileTerminal = MobileTerminal.fromJson(mobileTerminalData);
        var vesselGuid = "f45tc34-4fr534-5f35f345-asd324";
        var dto = mobileTerminal.getCarrierAssingmentDto(vesselGuid);

        expect(dto.mobileTerminalId.guid).toEqual("1234-5678-9012-3456-7891-2345-678901");
        expect(dto.connectId).toEqual(vesselGuid);
    }));

    it('assignToVesselByVesselGuid should set connectId to correct value', inject(function(MobileTerminal) {
        var mobileTerminal = MobileTerminal.fromJson(mobileTerminalData);
        var vesselGuid = "f45tc34-4fr534-5f35f345-asd324";
        mobileTerminal.assignToVesselByVesselGuid(vesselGuid);

        expect(mobileTerminal.connectId).toEqual(vesselGuid);
    }));

    it('should produce an activating/inactivating data transfer object', inject(function(MobileTerminal) {
        var mobileTerminal = MobileTerminal.fromJson(mobileTerminalData);
        var dto = JSON.parse(mobileTerminal.toSetStatusJson());
        expect(dto.guid).toEqual("1234-5678-9012-3456-7891-2345-678901");
    }));

    it('setSystemTypeToInmarsatC should set systemType to correct value', inject(function(MobileTerminal) {
        var mobileTerminal = new MobileTerminal();
        expect(mobileTerminal.type).toBeUndefined();
        mobileTerminal.setSystemTypeToInmarsatC();
        expect(mobileTerminal.type).toEqual("INMARSAT_C");
    }));

    it('addNewChannel should add a new channel to the end of the list of channels and return the new channel', inject(function(MobileTerminal) {
        var mobileTerminal = new MobileTerminal();
        expect(mobileTerminal.channels.length).toEqual(1);
        var newChannel = mobileTerminal.addNewChannel();
        expect(mobileTerminal.channels.length).toEqual(2);
        expect(newChannel).toBeDefined();
    }));

    it('should be possible to make a deep copy of a mobile terminal', inject(function(MobileTerminal) {
        var mt = MobileTerminal.fromJson(mobileTerminalData);
        expect(angular.equals(mt, mt.copy())).toBeTruthy();
    }));

    it('isEqualAttributesAndChannels should return true only when all attributes and channels are the same', inject(function(MobileTerminal) {
        var mt1 = MobileTerminal.fromJson(mobileTerminalData);
        var mt2 = MobileTerminal.fromJson(mobileTerminalData);
        expect(mt1.isEqualAttributesAndChannels(mt2)).toBeTruthy();
    }));

    it('isEqualAttributesAndChannels should return false when one attribute has changed', inject(function(MobileTerminal) {
        var mt1 = MobileTerminal.fromJson(mobileTerminalData);
        var mt2 = MobileTerminal.fromJson(mobileTerminalData);
        expect(mt1.isEqualAttributesAndChannels(mt2)).toBeTruthy();
        mt2.attributes.SOFTWARE_VERSION = "changed";
        expect(mt1.isEqualAttributesAndChannels(mt2)).toBeFalsy();
    }));

    it('isEqualAttributesAndChannels should return false when one attribute has been added', inject(function(MobileTerminal) {
        var mt1 = MobileTerminal.fromJson(mobileTerminalData);
        var mt2 = MobileTerminal.fromJson(mobileTerminalData);
        expect(mt1.isEqualAttributesAndChannels(mt2)).toBeTruthy();
        mt2.attributes.NEW = "TEST";
        expect(mt1.isEqualAttributesAndChannels(mt2)).toBeFalsy();
    }));

    it('isEqualAttributesAndChannels should return false when one attribute has been deleted', inject(function(MobileTerminal) {
        var mt1 = MobileTerminal.fromJson(mobileTerminalData);
        var mt2 = MobileTerminal.fromJson(mobileTerminalData);
        expect(mt1.isEqualAttributesAndChannels(mt2)).toBeTruthy();
        delete mt2.attributes.SOFTWARE_VERSION;
        expect(mt1.isEqualAttributesAndChannels(mt2)).toBeFalsy();
    }));

    it('isEqualAttributesAndChannels should return false when a channel has been changed', inject(function(MobileTerminal) {
        var mt1 = MobileTerminal.fromJson(mobileTerminalData);
        var mt2 = MobileTerminal.fromJson(mobileTerminalData);
        expect(mt1.isEqualAttributesAndChannels(mt2)).toBeTruthy();
        mt2.channels[0].capabilities.POLLABLE=false;
        expect(mt1.isEqualAttributesAndChannels(mt2)).toBeFalsy();
    }));

    it('isEqualAttributesAndChannels should return false when a channel has been added', inject(function(MobileTerminal, CommunicationChannel) {
        var mt1 = MobileTerminal.fromJson(mobileTerminalData);
        var mt2 = MobileTerminal.fromJson(mobileTerminalData);
        expect(mt1.isEqualAttributesAndChannels(mt2)).toBeTruthy();
        mt2.channels.push(new CommunicationChannel());
        expect(mt1.isEqualAttributesAndChannels(mt2)).toBeFalsy();
    }));

    it('isEqualAttributesAndChannels should return false when a channel has been deleted', inject(function(MobileTerminal, CommunicationChannel) {
        var mt1 = MobileTerminal.fromJson(mobileTerminalData);
        var mt2 = MobileTerminal.fromJson(mobileTerminalData);
        expect(mt1.isEqualAttributesAndChannels(mt2)).toBeTruthy();
        mt2.channels.splice(0,1);
        expect(mt1.isEqualAttributesAndChannels(mt2)).toBeFalsy();
    }));

    it('pluginIsInactive should return true when plugin->inactive is defined and set to true', inject(function(MobileTerminal, CommunicationChannel) {
        var mt = MobileTerminal.fromJson(mobileTerminalData);

        mt.plugin.inactive = true;
        expect(mt.pluginIsInactive()).toBeTruthy();

        mt.plugin.inactive = false;
        expect(mt.pluginIsInactive()).toBeFalsy();

        mt.plugin.inactive = undefined;
        expect(mt.pluginIsInactive()).toBeFalsy();

        mt.plugin = undefined;
        expect(mt.pluginIsInactive()).toBeFalsy();
    }));

    it('should transfer capabilities of removed channel to default channel', inject(function(CommunicationChannel, MobileTerminal) {
        var channel = new CommunicationChannel();
        channel.capabilities = {
            "POLLABLE": true,
            "CONFIGURABLE": true
        };

        var mt = new MobileTerminal();
        mt.channels.push(channel);
        mt.removeChannel(1);
        expect(mt.channels[0].capabilities["POLLABLE"]).toBeTruthy();
        expect(mt.channels[0].capabilities["CONFIGURABLE"]).toBeTruthy();
        expect(mt.channels[0].capabilities["DEFAULT_REPORTING"]).toBeTruthy();
    }));

});