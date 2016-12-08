/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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