describe('Poll', function() {

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
        "mobileTerminal": {
            "systemType": "INMARSAT_C",
            "idList": [
                {
                    "type": "INTERNAL_ID",
                    "value": "0"
                },
                {
                    "type": "SERIAL_NUMBER",
                    "value": "0"
                }
            ]
        },
        "pollId": 456,
        "pollType": "PROGRAM_POLL",
        "comment": "A little comment from the Supa dupa backend team!",
        "userName": "backend",
        "attributes": [
            {
                "key": "DNID",
                "value": "DNID"
            },
            {
                "key": "END_DATE",
                "value": "1430295134869"
            },
            {
                "key": "START_DATE",
                "value": "1430294134869"
            },
            {
                "key": "FREQUENCY",
                "value": 7200
            },
            {
                "key": "IN_PORT_GRACE",
                "value": "AMAZING GRACE"
            },
            {
                "key": "MEMBER_ID",
                "value": "132456"
            },
            {
                "key": "REPORT_FREQUENCY",
                "value": 3600
            },
            {
                "key": "RUNNING",
                "value": true
            },
            {
                "key": "USER",
                "value": "username"
            },
            {
                "key": "CONNECTION_ID",
                "value": "584f9a8e-d53a-448a-8b21-866f2a492987"
            }            
        ],
    };

    it('fromJson should build a correct object', inject(function(Poll) {
        var poll = Poll.fromJson(responseData);
        expect(poll.id).toEqual(responseData.pollId);
        expect(poll.type).toEqual(responseData.pollType);
        expect(poll.comment).toEqual(responseData.comment);
        expect(Object.keys(poll.attributes).length).toEqual(10);
        expect(poll.attributes["FREQUENCY"]).toEqual(7200);               
    }));

});


