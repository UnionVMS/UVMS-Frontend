describe('MobileTerminalModel', function() {

  beforeEach(module('unionvmsWeb'));

    var responseData = {
     "data":    {
        "attributes":       [
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
        ],
        "channels": [      {
           "channelType": "VMS",
           "memberId": 2,
           "dnid": 1,
           "order": 1,
           "startDate": 1428357600000,
           "stopDate": 1428357600000
        },
        {
           "channelType": "VMS",
           "memberId": 2,
           "dnid": 123,
           "order": 3,
           "startDate": 1428357600000,
           "stopDate": 1428357600000
        }        ],
        "mobileTerminalId":       {
           "systemType": "INMARSAT_C",
           "serialNumber": "SOAPTEST"
        },
        "carrierId":       {
           "carrierType": "VESSEL",
           "idType": "IRCS",
           "value": "ASDASD"
        },
        "active": false
     },
     "code": "200"
  };

  responseData = responseData.data;

    it('create new should set correct values', inject(function(MobileTerminal) {
        var mobileTerminal = new MobileTerminal();

        //MobileTerminalId
        expect(mobileTerminal.mobileTerminalId.systemType).toBeUndefined();
        expect(mobileTerminal.mobileTerminalId.serialNumber).toEqual("");

        //CarrierId
        expect(mobileTerminal.carrierId).toBeDefined();

        //Attributes
        expect(Object.keys(mobileTerminal.attributes).length).toEqual(0);

        //Channels (should be 1 from the start)
        expect(mobileTerminal.channels.length).toEqual(1);

        //Active
        expect(mobileTerminal.active).toEqual(true);

    }));

    it('fromJson should build a correct object', inject(function(MobileTerminal) {
        var mobileTerminal = MobileTerminal.fromJson(responseData);
        //MobileTerminalId
        expect(mobileTerminal.mobileTerminalId.systemType).toEqual(responseData.mobileTerminalId.systemType);
        expect(mobileTerminal.mobileTerminalId.serialNumber).toEqual(responseData.mobileTerminalId.serialNumber);

        //CarrierId
        expect(mobileTerminal.carrierId).toBeDefined();
        expect(mobileTerminal.carrierId.carrierType).toBeDefined();

        //Attributes
        expect(Object.keys(mobileTerminal.attributes).length).toEqual(9);
        expect(mobileTerminal.attributes["SATELLITE_NUMBER"]).toEqual("12345");

        //Channels
        expect(mobileTerminal.channels.length).toEqual(2);
        expect(mobileTerminal.channels[0].order).toEqual(1);
        expect(mobileTerminal.channels[1].dnid).toEqual(123);

        //Active
        expect(mobileTerminal.active).toEqual(false);

    }));

    it('toJson should return correctly formatted data', inject(function(MobileTerminal) {
        var mobileTerminal = MobileTerminal.fromJson(responseData);
        var toJsonObject = JSON.parse(mobileTerminal.toJson());
        expect(angular.equals(toJsonObject, responseData)).toBeTruthy();
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
