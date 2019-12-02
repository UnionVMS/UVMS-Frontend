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
describe('VesselNotesModel', function() {

  beforeEach(module('unionvmsWeb'));

    var notesData = {
      "date": "2016-03-29T08:55:27.795+02:00",
      "activityCode": "V02",
      "user": "VMS_ADMIN_COM",
      "readyDate": "2016-03-30T18:55:27.795+02:00",
      "licenseHolder": "781012-1234",
      "contact": "sten@sture",
      "sheetNumber": "XYZ-123",
      "notes": "Hej hej",
      "document": "how will this work, I wonder?",
      "source": "INTERNAL"
    };

    it('create new should set correct values', inject(function(VesselNotes) {
        var notes = new VesselNotes();

        expect(notes.date).toBeUndefined();
        expect(notes.activityCode).toBeUndefined();
        expect(notes.user).toBeUndefined();
        expect(notes.readyDate).toBeUndefined();
        expect(notes.licenseHolder).toBeUndefined();
        expect(notes.contact).toBeUndefined();
        expect(notes.sheetNumber).toBeUndefined();
        expect(notes.notes).toBeUndefined();
        expect(notes.document).toBeUndefined();
        expect(notes.source).toBeUndefined();
    }));

    it("fromDTO should create correct object", inject(function(VesselNotes) {
        var notes = VesselNotes.fromJson(notesData);
        expect(notes.date).toEqual(notesData.date);
        expect(notes.activityCode).toEqual(notesData.activityCode);
        expect(notes.user).toEqual(notesData.user);
        expect(notes.readyDate).toEqual(notesData.readyDate);
        expect(notes.licenseHolder).toEqual(notesData.licenseHolder);
        expect(notes.contact).toEqual(notesData.contact);
        expect(notes.sheetNumber).toEqual(notesData.sheetNumber);
        expect(notes.notes).toEqual(notesData.notes);
        expect(notes.document).toEqual(notesData.document);
        expect(notes.source).toEqual(notesData.source);
    }));

    it("copy should create an identical object", inject(function(VesselNotes) {
        var origNotes = VesselNotes.fromJson(notesData);
        var notesCopy = origNotes.copy();

        expect(notesCopy.date).toEqual(origNotes.date);
        expect(notesCopy.activityCode).toEqual(origNotes.activityCode);
        expect(notesCopy.user).toEqual(origNotes.user);
        expect(notesCopy.readyDate).toEqual(origNotes.readyDate);
        expect(notesCopy.licenseHolder).toEqual(origNotes.licenseHolder);
        expect(notesCopy.contact).toEqual(origNotes.contact);
        expect(notesCopy.sheetNumber).toEqual(origNotes.sheetNumber);
        expect(notesCopy.notes).toEqual(origNotes.notes);
        expect(notesCopy.document).toEqual(origNotes.document);
        expect(notesCopy.source).toEqual(origNotes.source);

    }));

});
