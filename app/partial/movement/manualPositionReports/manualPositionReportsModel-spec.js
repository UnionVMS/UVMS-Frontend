describe('ManualPosition', function() {

    beforeEach(module('unionvmsWeb'));

    var data = {
        id : "1",
        movement : {
            time: "",
            latitude : "32",
            longitude : "60",
            measuredSpeed : "22",
            course : "123"
        },
        vessel : {

            externalMarking : "NV 2231",
            cfr : "2222",
            name: "Nova",
            ircs : "1111"
        },
    };

     function verifyPosition(position) {
        expect(position.id).toEqual("1");       
        expect(position.movement.time).toEqual("");
        expect(position.movement.latitude).toEqual("32");
        expect(position.movement.longitude).toEqual("60");
        expect(position.movement.measuredSpeed).toEqual("22");
        expect(position.movement.course).toEqual("123");

        expect(position.vessel.externalMarking).toEqual("NV 2231");
        expect(position.vessel.cfr).toEqual("2222");
        expect(position.vessel.name).toEqual("Nova");
        expect(position.vessel.ircs).toEqual("1111");
        
     }

    it('should parse JSON input correctly', inject(function(ManualPosition) {
        verifyPosition(ManualPosition.fromJson(data));
    }));

});