describe('Movement', function() {

    beforeEach(module('unionvmsWeb'));
    var  move = {
        "guid": "73",
        "connectId": "67d73ab6-b461-432f-bded-d4548a08e3b1",
        "position": {
          "longitude": 1.0,
          "latitude": 55.0,
        },
        "positionTime": 1431106680000,
        "reportedCourse": 3.3,
        "reportedSpeed": 2,
        "status": "33",
        "calculatedSpeed": 12,
        "movementType": "POS",
        "source": "INMARSAT_C"
    };

     function verifyMovement(movement) {
        expect(movement.guid).toEqual(move.guid);
        expect(movement.time).toEqual(move.positionTime);

        expect(movement.connectId).toEqual(move.connectId);

        expect(movement.movement.latitude).toEqual(move.position.latitude);
        expect(movement.movement.longitude).toEqual(move.position.longitude);
        expect(movement.movement.status).toEqual(move.status);
        expect(movement.movement.source).toEqual(move.source);
        expect(movement.movement.reportedCourse).toEqual(move.reportedCourse);
        expect(movement.movement.reportedSpeed).toEqual(move.reportedSpeed);
        expect(movement.movement.calculatedSpeed).toEqual(move.calculatedSpeed);
        expect(movement.movement.movementType).toEqual(move.movementType);
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

    it('isEqualMovement should return true only when guid is the same', inject(function(Movement, Vessel) {
        var movement = Movement.fromJson();
        var movement2 = Movement.fromJson();
        var movement3 = new Movement();
        movement3.guid = movement.guid;

        //Same guid means isEqualMovement is true
        expect(movement.isEqualMovement(movement2)).toBeTruthy();
        expect(movement.isEqualMovement(movement3)).toBeTruthy();

        //Different guid means isEqualMovement is false
        movement2.guid = "changed";
        expect(movement.isEqualMovement(movement2)).toBeFalsy();
    }));
 });