describe('Audit', function() {

    beforeEach(module('unionvmsWeb'));

    var auditResponse = {
        username: "niclas",
        operation: "Create",
        objectType: "User",
        timestamp: "2015-06-24T15:53:59Z"
    };

    it('should parse transfer object', inject(function(Audit) {
        var audit = Audit.fromJson(auditResponse);
        expect(audit.username).toEqual("niclas");
        expect(audit.operation).toEqual("Create");
        expect(audit.objectType).toEqual("User");
        expect(audit.date).toEqual("2015-06-24T15:53:59Z");
    }));

 });