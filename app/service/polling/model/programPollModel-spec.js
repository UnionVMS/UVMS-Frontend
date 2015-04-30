describe('ProgramPoll', function() {

  beforeEach(module('unionvmsWeb'));

  var locale;

    beforeEach(function() {
        locale = {
            getString : function(s){
                if(s === 'common.time_second_short'){
                    return 's';
                }
                else if(s === 'common.time_minute_short'){
                    return 'min';
                }         
                else if(s === 'common.time_hour_short'){
                    return 'h';
                }                          
            }
          };

        module(function ($provide) {
          $provide.value('locale', locale);
        });          
      });      
  

    var responseData =  {
        "frequency": 7200,
        "date": {
            "startDate": 1430294134869,
            "endDate": 1430295134869
        },
        "comChannel": {
            "type": "DNID",
            "value": "DNID0"
        },
        "mobileTerminal": {
            "systemType": "INMARSAT_C",
            "idList": [
                {
                    "type": "INTERNAL_ID",
                    "value": "25"
                },
                {
                    "type": "SERIAL_NUMBER",
                    "value": "0"
                }
            ]
        },
        "comment": "This is a little comment!"
    };

    it('fromJson should build a correct object', inject(function(ProgramPoll) {
        var programPoll = ProgramPoll.fromJson(responseData);
        expect(programPoll.frequency).toEqual(responseData.frequency);
        expect(programPoll.comment).toEqual(responseData.comment);
        expect(programPoll.startDate).toEqual(responseData.date.startDate);
        expect(programPoll.endDate).toEqual(responseData.date.endDate);
        expect(programPoll.channel.type).toEqual(responseData.comChannel.type);
        expect(programPoll.channel.value).toEqual(responseData.comChannel.value);

        expect(programPoll.mobileTerminalId.systemType).toEqual(responseData.mobileTerminal.systemType);
        expect(programPoll.mobileTerminalId.ids["INTERNAL_ID"]).toEqual("25");        
        expect(programPoll.mobileTerminalId.ids["SERIAL_NUMBER"]).toEqual("0");
    }));

    it('toJson should return correctly formatted data', inject(function(ProgramPoll) {
        var programPoll = ProgramPoll.fromJson(responseData);
        var toJsonObject = JSON.parse(programPoll.toJson());
        expect(angular.equals(toJsonObject, responseData)).toBeTruthy();
    }));

    it('getFormattedStartDate should format date correct', inject(function(ProgramPoll) {
        var programPoll = ProgramPoll.fromJson(responseData);
        expect(programPoll.getFormattedStartDate()).toEqual("2015-04-29 09:55");
    }));

    it('getFormattedEndDate should format date correct', inject(function(ProgramPoll) {
        var programPoll = ProgramPoll.fromJson(responseData);
        expect(programPoll.getFormattedEndDate()).toEqual("2015-04-29 10:12");
    }));

    it('getFrequencyAsText should return correct', inject(function(ProgramPoll) {
        var programPoll = ProgramPoll.fromJson(responseData);
        expect(programPoll.getFrequencyAsText()).toEqual("2h");

        programPoll.frequency = 1800;
        expect(programPoll.getFrequencyAsText()).toEqual("30 min");

        programPoll.frequency = 18600;
        expect(programPoll.getFrequencyAsText()).toEqual("5h 10 min");

        programPoll.frequency = 5400;
        expect(programPoll.getFrequencyAsText()).toEqual("1h 30 min");

        programPoll.frequency = 7000;
        expect(programPoll.getFrequencyAsText()).toEqual("1h 56 min");        

        programPoll.frequency = 24;
        expect(programPoll.getFrequencyAsText()).toEqual("24 s");                
    }));


});


