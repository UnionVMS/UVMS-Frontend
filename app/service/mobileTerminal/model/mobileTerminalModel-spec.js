describe('MobileTerminalModel', function() {

  beforeEach(module('unionvmsWeb'));

    var attributes = [
        {
            "fieldType": "SATELLITE_NUMBER",
            "value": "12345"
        },
        {
            "fieldType": "TRANSCEIVER_TYPE",
            "value": "TRANS_1"
        },
        {
            "fieldType": "SOFTWARE_VERSION",
            "value": "2.0.3"
        },
        {
            "fieldType": "ANTENNA",
            "value": "MY ANTENNA"
        },
        {
            "fieldType": "ANSWER_BACK",
            "value": "BACKBACK"
        },
        {
            "fieldType": "INSTALLED_BY",
            "value": "JOHN SMITH"
        },
        {
            "fieldType": "INSTALLED_ON",
            "value": "2006-04-03"
        },
        {
            "fieldType": "STARTED_ON",
            "value": "2006-04-03"
        },
        {
            "fieldType": "UNINSTALLED_ON",
            "value": "2009-12-22"
        }
    ];

    var channels = [      
        {
            "channelType": "VMS",
            "idList": [
                {
                    "type":"DNID",
                    "value":"999"
                },
                {
                    "type":"MEMBER_ID",
                    "value":"4444"
                }
            ],
            "order": 1,
            "startDate": 1428357600000,
            "stopDate": 1428357600000
        },
        {
            "channelType": "VMS",
            "order": 3,
            "startDate": 1428357600000,
           "stopDate": 1428357600000,
            "idList": [
                {
                    "type":"DNID",
                    "value":"234"
                },
                {
                    "type":"MEMBER_ID",
                    "value":"67567"
                }
            ],             
        }];

    var mobileTerminalId = {
        "systemType": "INMARSAT_C",
        "idList": [
            {
                "type": "SERIAL_NUMBER", 
                "value": "SSE3456"
            }, 
            {
                "type": "INTERNAL_ID", 
                "value": "260"
            }
        ]
    };

    var carrierId = {
        "carrierType": "VESSEL",
        "idType": "IRCS",
        "value": "ASDASD"
    };

    /* Message send TO the server */
    var requestData = {
        "attributes": attributes,
        "channels": channels,
        "mobileTerminalId": mobileTerminalId
    };

    /* Message received FROM the server */
    var responseData = {
        "data": {
            "attributes": attributes,
            "channels": channels,
            "mobileTerminalId": mobileTerminalId,
            "carrierId": carrierId,
            "inactive": false,
            "source" : "INTERNAL"
        },
        "code": "200"
    };

    var assignJsonPost = {
        "mobileTerminalId": mobileTerminalId,
        "carrierId": {
           "carrierType": "VESSEL",
           "idType": "IRCS",
           "value": "ASDASD"
        }
    };

    var mobileTerminalIdOnlyJson = mobileTerminalId;

    responseData = responseData.data;

    it('create new should set correct values', inject(function(MobileTerminal) {
        var mobileTerminal = new MobileTerminal();

        //MobileTerminalId
        expect(mobileTerminal.mobileTerminalId.systemType).toBeUndefined();
        expect(mobileTerminal.mobileTerminalId.ids).toEqual({});

        //CarrierId
        expect(mobileTerminal.carrierId).toBeUndefined();

        //Attributes
        expect(Object.keys(mobileTerminal.attributes).length).toEqual(0);

        //Channels (should be 1 from the start)
        expect(mobileTerminal.channels.length).toEqual(1);

        //Inactive
        expect(mobileTerminal.active).toEqual(true);

    }));

    it('fromJson should build a correct object', inject(function(MobileTerminal) {
        var mobileTerminal = MobileTerminal.fromJson(responseData);
        //MobileTerminalId
        expect(mobileTerminal.mobileTerminalId.systemType).toEqual(responseData.mobileTerminalId.systemType);
        expect(Object.keys(mobileTerminal.mobileTerminalId.ids).length).toEqual(2);
        expect(mobileTerminal.mobileTerminalId.ids["SERIAL_NUMBER"]).toEqual("SSE3456");
        expect(mobileTerminal.mobileTerminalId.ids["INTERNAL_ID"]).toEqual("260");

        //CarrierId
        expect(mobileTerminal.carrierId).toBeDefined();
        expect(mobileTerminal.carrierId.carrierType).toBeDefined();

        //Attributes
        expect(Object.keys(mobileTerminal.attributes).length).toEqual(9);
        expect(mobileTerminal.attributes["SATELLITE_NUMBER"]).toEqual("12345");

        //Channels
        expect(mobileTerminal.channels.length).toEqual(2);
        expect(mobileTerminal.channels[0].order).toEqual(1);
        expect(mobileTerminal.channels[0].ids["DNID"]).toEqual("999");
        expect(mobileTerminal.channels[1].ids["MEMBER_ID"]).toEqual("67567");

        //Active
        expect(mobileTerminal.active).toEqual(true);

        //Source
        expect(mobileTerminal.source).toEqual("INTERNAL");

    }));

    it('toJson should return correctly formatted data', inject(function(MobileTerminal) {
        var mobileTerminal = MobileTerminal.fromJson(requestData);
        var toJsonObject = JSON.parse(mobileTerminal.toJson());
        expect(angular.equals(toJsonObject, requestData)).toBeTruthy();
    }));

    it('toAssignJson should return correctly formatted data', inject(function(MobileTerminal, CarrierId) {
        var mobileTerminal = MobileTerminal.fromJson(responseData);
        var carrierId = CarrierId.createVesselWithIrcs("ASDASD");
        var toJsonObject = JSON.parse(mobileTerminal.toAssignJson(carrierId));
        expect(angular.equals(toJsonObject, assignJsonPost)).toBeTruthy();
    }));

    it('toSetStatusJson should return correctly formatted data', inject(function(MobileTerminal) {
        var mobileTerminal = MobileTerminal.fromJson(responseData);
        var toJsonObject = JSON.parse(mobileTerminal.toSetStatusJson());
        expect(angular.equals(toJsonObject, mobileTerminalIdOnlyJson)).toBeTruthy();
    }));
    


    it('setSystemTypeToInmarsatC should set systemType to correct value', inject(function(MobileTerminal) {
        var mobileTerminal = new MobileTerminal();
        expect(mobileTerminal.mobileTerminalId.systemType).toBeUndefined();
        mobileTerminal.setSystemTypeToInmarsatC();
        expect(mobileTerminal.mobileTerminalId.systemType).toEqual("INMARSAT_C");

    }));

    it('addNewChannel should add a new channel to the end of the list of channels', inject(function(MobileTerminal) {
        var mobileTerminal = new MobileTerminal();
        expect(mobileTerminal.channels.length).toEqual(1);
        mobileTerminal.addNewChannel();
        expect(mobileTerminal.channels.length).toEqual(2);

    }));


});
