describe('ManualPosition', function() {

    beforeEach(module('unionvmsWeb'));
        var data = {
            guid : "12345-qwert-12345-asdfg-1qaz2",
            speed : 15,
            course : 34,
            time : "2013-02-08 09:30",
            updatedTime : "",
            status : "",
            archived : false,

            asset : {
                extMarking : "EXTM",
                cfr : "1111",
                name :"Nova",
                ircs :"222",
                flagState :"Swe"
                },

            position : {
                latitude : 34,
                longitude : 50
            }
        };


     function verifyPosition(position) {
        expect(position.guid).toEqual("12345-qwert-12345-asdfg-1qaz2");
        expect(position.speed).toEqual(15);
        expect(position.course).toEqual(34);
        expect(position.time).toEqual("2013-02-08 09:30");
        expect(position.updatedTime).toEqual("");
        expect(position.status).toEqual("");
        expect(position.archived).toEqual(false);

        expect(position.carrier.externalMarking).toEqual("EXTM");
        expect(position.carrier.cfr).toEqual("1111");

        expect(position.carrier.name).toEqual("Nova");
        expect(position.carrier.ircs).toEqual("222");
        expect(position.carrier.flagState).toEqual("Swe");

        expect(position.position.latitude).toEqual(34);
        expect(position.position.longitude).toEqual(50);
     }

    it('should parse JSON input correctly', inject(function(ManualPosition) {
        verifyPosition(ManualPosition.fromJson(data));
    }));

    it('getDto() should create correct object', inject(function(ManualPosition) {
        var position = ManualPosition.fromJson(data);
        var dto = position.getDto();

        expect(dto.guid).toEqual(data.guid);
        expect(dto.speed).toEqual(data.speed);
        expect(dto.course).toEqual(data.course);
        expect(dto.time).toEqual(data.time);
        expect(dto.updatedTime).toEqual(data.updatedTime);
        expect(dto.status).toEqual(data.status);
        expect(dto.archived).toEqual(data.archived);

        expect(dto.asset.extMarking).toEqual(data.asset.extMarking);
        expect(dto.asset.cfr).toEqual(data.asset.cfr);

        expect(dto.asset.name).toEqual(data.asset.name);
        expect(dto.asset.ircs).toEqual(data.asset.ircs);
        expect(dto.asset.flagState).toEqual(data.asset.flagState);

        expect(dto.position.latitude).toEqual(data.position.latitude);
        expect(dto.position.longitude).toEqual(data.position.longitude);
    }));
 });