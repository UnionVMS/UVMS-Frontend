/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
describe('VesselContactModel', function() {

  beforeEach(module('unionvmsWeb'));

    var contactData = {
        "name": "Kaninen",
        "number": "0701222222",
        "email": "kanin@skogen",
        "owner": false,
        "source": "INTERNAL"
    };

    it('create new should set correct values', inject(function(VesselContact) {
        var contact = new VesselContact();

        expect(contact.name).toBeUndefined();
        expect(contact.number).toBeUndefined();
        expect(contact.email).toBeUndefined();
        expect(contact.owner).toBeUndefined();
        expect(contact.source).toBeUndefined();
    }));

    it("fromDTO should create correct object", inject(function(VesselContact) {
        var contact = VesselContact.fromDTO(contactData);
        expect(contact.name).toEqual(contactData.name);
        expect(contact.number).toEqual(contactData.number);
        expect(contact.email).toEqual(contactData.email);
        expect(contact.owner).toEqual(contactData.owner);
        expect(contact.source).toEqual(contactData.source);
    }));

    it("copy should create an identical object", inject(function(VesselContact) {
        var origContact = VesselContact.fromDTO(contactData);
        var contactCopy = origContact.copy();

        expect(contactCopy.name).toEqual(origContact.name);
        expect(contactCopy.number).toEqual(origContact.number);
        expect(contactCopy.email).toEqual(origContact.email);
        expect(contactCopy.owner).toEqual(origContact.owner);
        expect(contactCopy.source).toEqual(origContact.source);

    }));

});
