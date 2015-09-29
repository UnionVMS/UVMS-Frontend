describe('Movement', function() {

    beforeEach(module('unionvmsWeb'));
    var  move = {
        "id": "73",
        "connectId": "67d73ab6-b461-432f-bded-d4548a08e3b1",
        "position": {
          "longitude": 1.0,
          "latitude": 55.0,
          "calculatedSpeed" : 11.4
        },
        "positionTime": 1431106680000,
        "status": "33",
        "measuredSpeed": 12,
        "course": 24,
        "messageType": "POS",
        "source": "INMARSAT_C"
    };

     function verifyMovement(movement) {
        expect(movement.id).toEqual(move.id);
        expect(movement.time).toEqual(move.positionTime);

        expect(movement.connectId).toEqual(move.connectId);

        expect(movement.movement.latitude).toEqual(move.position.latitude);
        expect(movement.movement.longitude).toEqual(move.position.longitude);
        expect(movement.movement.calculatedSpeed).toEqual(move.position.calculatedSpeed);
        expect(movement.movement.status).toEqual(move.status);
        expect(movement.movement.source).toEqual(move.source);
        expect(movement.movement.measuredSpeed).toEqual(move.measuredSpeed);
        expect(movement.movement.course).toEqual(move.course);
        expect(movement.movement.messageType).toEqual(move.messageType);
    }

    it('Should parse JSON input correctly', inject(function(Movement) {
        verifyMovement(Movement.fromJson(move));
    }));


    it('setVesselData should set correct data', inject(function(Movement, Vessel) {
        var movement = Movement.fromJson();
        var vessel = new Vessel();
        vessel.name = "TestName";
        vessel.ircs = "TestIRCS";
        vessel.countryCode = "TestContryCode";
        vessel.externalMarking = "TestExternalMarking";
        movement.setVesselData(vessel);
        expect(movement.vessel.name).toEqual(vessel.name);
        expect(movement.vessel.ircs).toEqual(vessel.ircs);
        expect(movement.vessel.state).toEqual(vessel.countryCode);
        expect(movement.vessel.externalMarking).toEqual(vessel.externalMarking);
    }));
 });