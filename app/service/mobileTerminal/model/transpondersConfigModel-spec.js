describe('TranspondersConfig', function() {

  beforeEach(module('unionvmsWeb'));

    var transponderConfigs =
    [
        {
            "terminalSystemType": "INMARSAT_C",
            "terminalFieldList": [
                "TRANSCEIVER_TYPE",
                "SERIAL_NUMBER",
                "SOFTWARE_VERSION",
                "ANTENNA",
                "ANTENNA_SERIAL_NUMBER",
                "SATELLITE_NUMBER",
                "ANSWER_BACK",
                "INSTALLED_BY",
                "INSTALLED_ON",
                "STARTED_ON",
                "UNINSTALLED_ON",
                "FREQUENCY_EXPECTED",
                "FREQUENCY_GRACE_PERIOD",
                "FREQUENCY_IN_PORT",
                "LES",
                "MULTIPLE_OCEAN"
            ],
            "channelFieldList": [
                "DNID",
                "MEMBER_NUMBER",
                "START_DATE",
                "END_DATE",
                "DEFAULT_REPORTING",
                "LES_DESCRIPTION",
                "POLLABLE",
                "CONFIGURABLE"
            ],
            "capabilityList": [
                {
                    "name": "IS_POLLABLE",
                    "optionList": []
                },
                {
                    "name": "IS_CONFIGURABLE",
                    "optionList": []
                },
                {
                    "name": "SUPPORT_MULTIPLE_OCEAN",
                    "optionList": [
                        {
                            "code": 581,
                            "name": "EAST_ATLANTIC"
                        },
                        {
                            "code": 582,
                            "name": "PACIFIC"
                        },
                        {
                            "code": 583,
                            "name": "INDIAN"
                        },
                        {
                            "code": 584,
                            "name": "WEST_ATLANTIC"
                        }
                    ]
                },
                {
                    "name": "SUPPORT_SAMPLING",
                    "optionList": []
                },
                {
                    "name": "HAS_LES",
                    "optionList": [
                        {
                            "name": "EIK"
                        },
                        {
                            "name": "BURUM"
                        }
                    ]
                }
            ]
        }
    ];

    it('create new should set correct values', inject(function(TranspondersConfig) {
        var transpondersConfig = new TranspondersConfig();
        expect(Object.keys(transpondersConfig.terminalConfigs).length).toEqual(0);
    }));

    it("getTerminalConfigBySystemName should return correct object", inject(function(TranspondersConfig) {
        var transpondersConfig = TranspondersConfig.fromJson(transponderConfigs);
        expect(Object.keys(transpondersConfig.terminalConfigs).length).toEqual(1);
        var name ="INMARSAT-C";
        var inmarsatConfig1 = transpondersConfig.getTerminalConfigBySystemName(name);
        var inmarsatConfig2 = transpondersConfig.terminalConfigs[name];
        expect(inmarsatConfig1).toEqual(inmarsatConfig2);
    }));

    it("should parse JSON correctly", inject(function(TranspondersConfig) {
        var transpondersConfig = TranspondersConfig.fromJson(transponderConfigs);
        expect(Object.keys(transpondersConfig.terminalConfigs).length).toEqual(1);

        //Validate config for INMARSAT-C
        var systemType = transponderConfigs[0].terminalSystemType;
        var inmarsatConfig = transpondersConfig.getTerminalConfigBySystemName(systemType);

        expect(inmarsatConfig.systemType).toEqual(systemType);
        expect(inmarsatConfig.viewName).toBeDefined();

        //Terminal fields
        var expectedTerminalFields = transponderConfigs[0].terminalFieldList;
        expect(Object.keys(inmarsatConfig.terminalFields).length).toEqual(expectedTerminalFields.length);


        //Channel fields
        var expectedChannelFields = transponderConfigs[0].channelFieldList;
        expect(Object.keys(inmarsatConfig.channelFields).length).toEqual(expectedChannelFields.length);

        //Capabilites
        var expectedCapabilites = transponderConfigs[0].capabilityList;
        expect(Object.keys(inmarsatConfig.capabilities).length).toEqual(expectedCapabilites.length);

        //Capability with empty optionsList
        expect(inmarsatConfig.capabilities["IS_POLLABLE"]).toEqual(true);

        //Capability with optionsList with options with "name" and "code"
        var oceaRegionsCapability = inmarsatConfig.capabilities["SUPPORT_MULTIPLE_OCEAN"];
        expect(oceaRegionsCapability.length).toEqual(4);
        var firstOption = oceaRegionsCapability[0];
        expect(firstOption.name).toEqual(expectedCapabilites[2].optionList[0].name);
        expect(firstOption.code).toEqual(expectedCapabilites[2].optionList[0].code);


        //Capability with optionsList with options with "name" only
        var LESCapability = inmarsatConfig.capabilities["HAS_LES"];
        expect(LESCapability.length).toEqual(2);
        firstOption = LESCapability[0];
        expect(firstOption.name).toEqual(expectedCapabilites[4].optionList[0].name);
        expect(firstOption.code).toEqual(expectedCapabilites[4].optionList[0].name);

    }));
     
});
