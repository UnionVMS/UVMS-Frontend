describe('ManualPosition', function() {

    beforeEach(module('unionvmsWeb'));
        var data = {

            id : "1",    
            guid : "12345-qwert-12345-asdfg-1qaz2",
            speed : 15,
            course : 34,
            time : "2013-02-08 09:30",
            updatedTime : "",
            status : "",
            archived : false,
            
            carrier : {
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
        expect(position.id).toEqual("1");
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
 });