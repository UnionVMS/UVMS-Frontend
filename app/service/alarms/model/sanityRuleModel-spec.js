describe('SanityRule', function() {

  beforeEach(module('unionvmsWeb'));


    beforeEach(inject(function($httpBackend) {
        //Mock translation files
        $httpBackend.whenGET(/usm/).respond({});
        $httpBackend.whenGET(/i18n/).respond({});
    }));

    var sanityRuleDTO = {
        "guid": "Asset not found",
        "name": "Asset not found",
        "description": "An asset must exist",
        "expression": "assetGuid == null",
        "updated": "2015-12-17 17:59:08 +0100",
        "updatedBy": "UVMS"
    };


    it("should parse DTO correctly", inject(function(SanityRule) {
        var rule = SanityRule.fromDTO(sanityRuleDTO);

        expect(rule.guid).toEqual(sanityRuleDTO.guid);
        expect(rule.name).toEqual(sanityRuleDTO.name);
        expect(rule.description).toEqual(sanityRuleDTO.description);
        expect(rule.expression).toEqual(sanityRuleDTO.expression);
        expect(rule.updatedBy).toEqual(sanityRuleDTO.updatedBy);
        expect(rule.dateUpdated).toEqual(sanityRuleDTO.updated);

    }));

});
