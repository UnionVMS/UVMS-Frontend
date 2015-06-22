describe('Movement', function() {

    beforeEach(module('unionvmsWeb'));
        var move = {
            id : "1", 
            //time : "2015-06-19 09:30",
            vessel : {
                flagState : "SWE",
                externalMarking : "SWE BRI",
                ircs : "12345",
                name : "Britannia"
            },
            movement : {
                latitude : 34 ,
                longitude : 43,
                status : "",
                source : "local",
                measuredSpeed : 12, 
                calculatedSpeed : 11.4, 
                course : 42,
                messageType : "message" 
            }
        };

     function verifyMovement(movement) {
        expect(movement.id).toEqual("1");
        expect(movement.time).toEqual("-");
        //expect(movement.time).toEqual("2015-06-19 09:30");

        expect(movement.vessel.state).toEqual("SWE");
        expect(movement.vessel.externalMarking).toEqual("SWE BRI");
        expect(movement.vessel.ircs).toEqual("12345");
        expect(movement.vessel.name).toEqual("Britannia");

        expect(movement.movement.latitude).toEqual(34);
        expect(movement.movement.longitude).toEqual(43);
        expect(movement.movement.status).toEqual("");
        expect(movement.movement.source).toEqual("local");
        expect(movement.movement.measuredSpeed).toEqual(12);
        expect(movement.movement.calculatedSpeed).toEqual(11.4);
        expect(movement.movement.course).toEqual(42);
        expect(movement.movement.messageType).toEqual("-");
    }

    it('Should parse JSON input correctly', inject(function(Movement) {
        verifyMovement(Movement.fromJson(move));
    }));

 });