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
        "serialNo": "4TT097411A33",
        "satelliteNumber": "426 572 212",
        "antenna": "Sailor 640",
        "transceiverType": "Sailor 6140",
        "softwareVersion" : "1.3-6",                
        "asset": {
            "id" : "ebeec8ef-2eab-4d4f-9d6d-994ad8b57c34"
        },
        "channels": [
            {
                "dnid" : "11456",
                "memberNumber": "101",
                "startDate" : "2019-01-08T09:00:00Z",
                "endDate": "2019-01-08T15:00:00Z",
                "pollChannel" : true,
                "configChannel": false,
                "name": "VMS"
            },
            {
                "dnid" : "11456",
                "memberNumber": "102",
                "startDate" : "2019-01-07T09:00:00Z",
                "endDate": "2019-01-07T15:00:00Z",
                "pollChannel" : false,
                "configChannel": true,
                "name": "HAV"
            }
        ],
        "active": true,
        "id": "1234-5678-9012-3456-7891-2345-678901",        
        "source": "INTERNAL",
        "mobileTerminalType": "INMARSAT_C",
        "plugin" : {
            "name" : "BURUM",
            "pluginServiceName" : "TestName",
            "pluginInactive" : false
        }

    };

    it('create new should set correct values', inject(function(MobileTerminal) {
        var mobileTerminal = new MobileTerminal();

        expect(mobileTerminal.id).toBeUndefined();
        expect(mobileTerminal.connectId).toBeUndefined();
        expect(mobileTerminal.plugin).toBeDefined();        
        expect(mobileTerminal.channels.length).toEqual(1);
        expect(mobileTerminal.active).toEqual(false);
    }));

    it("should parse JSON correctly", inject(function(MobileTerminal, unitConversionService) {
        var mt = MobileTerminal.fromJson(mobileTerminalData);

        expect(mt.id).toBe("1234-5678-9012-3456-7891-2345-678901");
        expect(mt.source).toBe("INTERNAL");
        expect(mt.mobileTerminalType).toBe("INMARSAT_C");
        expect(mt.active).toBe(true);

        expect(mt.plugin.name).toBe("BURUM");
        expect(mt.plugin.pluginServiceName).toBe("TestName");
        expect(mt.plugin.pluginInactive).toBe(false);
        expect(mt.connectId).toBe("ebeec8ef-2eab-4d4f-9d6d-994ad8b57c34");

        // Check that all attributes were parsed.
        expect(mt.transceiverType).toBe("Sailor 6140");
        expect(mt.serialNo).toBe("4TT097411A33");
        expect(mt.softwareVersion).toBe("1.3-6");
        expect(mt.antenna).toBe("Sailor 640");
        expect(mt.satelliteNumber).toBe("426 572 212");

        // Check that all channels were parsed.
        expect(mt.channels.length).toBe(2);
        expect(mt.channels[0].name).toBe("VMS");
        expect(mt.channels[0].DNID).toBe("11456");
        expect(mt.channels[0].memberNumber).toBe("101");

        var startDate1 = unitConversionService.date.convertDate(mt.channels[0].startDate, 'from_server');
        var endDate1 = unitConversionService.date.convertDate(mt.channels[0].endDate, 'from_server');

        expect(startDate1).toBe("2019-01-08 10:00:00 +0000");
        expect(endDate1).toBe("2019-01-08 16:00:00 +0000");
        expect(mt.channels[0].pollChannel).toBe(true);
        expect(mt.channels[0].configChannel).toBe(false);

        expect(mt.channels[1].name).toBe("HAV");    
        expect(mt.channels[1].DNID).toBe("11456");
        expect(mt.channels[1].memberNumber).toBe("102");

        var startDate2 = unitConversionService.date.convertDate(mt.channels[1].startDate, 'from_server');
        var endDate2 = unitConversionService.date.convertDate(mt.channels[1].endDate, 'from_server');

        expect(startDate2).toBe("2019-01-07 10:00:00 +0000");
        expect(endDate2).toBe("2019-01-07 16:00:00 +0000");
        expect(mt.channels[1].pollChannel).toBe(false);
        expect(mt.channels[1].configChannel).toBe(true);
    }));

    it('should produce a transfer object containing channels and mobile terminal ID', inject(function(MobileTerminal) {
        var dto = MobileTerminal.fromJson(mobileTerminalData).dataTransferObject();

        expect(angular.equals(dto.id, mobileTerminalData.id)).toBeTruthy();
        expect(angular.equals(dto.channels[0].name, mobileTerminalData.channels[0].name)).toBeTruthy();
        expect(angular.equals(dto.channels[0].id, mobileTerminalData.channels[0].id)).toBeTruthy();
        expect(angular.equals(dto.channels[0].frequencyGracePeriod, mobileTerminalData.channels[0].frequencyGracePeriod)).toBeTruthy();
        expect(angular.equals(dto.channels[0].expectedFrequencyInPort, mobileTerminalData.channels[0].expectedFrequencyInPort)).toBeTruthy();
        expect(angular.equals(dto.channels[0].expectedFrequency, mobileTerminalData.channels[0].expectedFrequency)).toBeTruthy();
        expect(angular.equals(dto.channels[0].lesDescription, mobileTerminalData.channels[0].lesDescription)).toBeTruthy();
        expect(angular.equals(dto.channels[0].memberNumber, mobileTerminalData.channels[0].memberNumber)).toBeTruthy();
        expect(angular.equals(dto.channels[0].installedBy, mobileTerminalData.channels[0].installedBy)).toBeTruthy();
        expect(angular.equals(dto.channels[0].installDate, mobileTerminalData.channels[0].installDate)).toBeTruthy();
        expect(angular.equals(dto.channels[0].uninstallDate, mobileTerminalData.channels[0].uninstallDate)).toBeTruthy();
        expect(angular.equals(dto.channels[0].archived, mobileTerminalData.channels[0].archived)).toBeTruthy();
        expect(angular.equals(dto.channels[0].defaultChannel, mobileTerminalData.channels[0].defaultChannel)).toBeTruthy();
        expect(angular.equals(dto.channels[0].configChannel, mobileTerminalData.channels[0].configChannel)).toBeTruthy();
        expect(angular.equals(dto.channels[0].pollChannel, mobileTerminalData.channels[0].pollChannel)).toBeTruthy();


        expect(angular.equals(dto.plugin, mobileTerminalData.plugin)).toBeTruthy();
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
        expect(dto.id).toEqual("1234-5678-9012-3456-7891-2345-678901");
    }));

    it('setSystemTypeToInmarsatC should set systemType to correct value', inject(function(MobileTerminal) {
        var mobileTerminal = new MobileTerminal();
        expect(mobileTerminal.mobileTerminalType).toBeUndefined();
        mobileTerminal.setSystemTypeToInmarsatC();
        expect(mobileTerminal.mobileTerminalType).toEqual("INMARSAT_C");
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

    it('pluginIsInactive should return true when plugin->inactive is defined and set to true', inject(function(MobileTerminal, CommunicationChannel) {
        var mt = MobileTerminal.fromJson(mobileTerminalData);

        mt.plugin.pluginInactive = true;
        expect(mt.pluginIsInactive()).toBeTruthy();

        mt.plugin.pluginInactive = false;
        expect(mt.pluginIsInactive()).toBeFalsy();

        mt.plugin.pluginInactive = undefined;
        expect(mt.pluginIsInactive()).toBeFalsy();

        mt.plugin = undefined;
        expect(mt.pluginIsInactive()).toBeFalsy();
    }));

    it('should transfer capabilities of removed channel to default channel', inject(function(CommunicationChannel, MobileTerminal) {
        var channel = new CommunicationChannel();        
        channel.pollChannel = true;
        channel.configChannel = true;

        var mt = new MobileTerminal();
        expect(mt.channels.length).toBe(1);
        mt.channels.push(channel);
        expect(mt.channels.length).toBe(2);
        mt.removeChannel(1);
        expect(mt.channels[0].pollChannel).toBeTruthy();
        expect(mt.channels[0].configChannel).toBeTruthy();        
    }));

});
