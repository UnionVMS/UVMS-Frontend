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
angular.module('unionvmsWeb')
.factory('VesselNotes', function() {

        function VesselNotes() {
            this.id = undefined;
            this.date = undefined;
            this.activity = undefined;
            this.user = undefined;
            this.readyDate = undefined;
            this.licenseHolder = undefined;
            this.contact = undefined;
            this.sheetNumber = undefined;
            this.notes = undefined;
            this.document = undefined;
            this.source = undefined;
        }

        VesselNotes.fromDTO = function(data){
            var notes = new VesselNotes();
            notes.id = data.id;
            notes.date = data.date;
            notes.activity = data.activity;
            notes.user = data.user;
            notes.readyDate = data.readyDate;
            notes.licenseHolder = data.licenseHolder;
            notes.contact = data.contact;
            notes.sheetNumber = data.sheetNumber;
            notes.notes = data.notes;
            notes.document = data.document;
            notes.source = data.source;
            return notes;
        };

        VesselNotes.prototype.copy = function() {
            var copy = new VesselNotes();
            copy.id = this.id;
            copy.date = this.date;
            copy.activity = this.activity;
            copy.user = this.user;
            copy.readyDate = this.readyDate;
            copy.licenseHolder = this.licenseHolder;
            copy.contact = this.contact;
            copy.sheetNumber = this.sheetNumber;
            copy.notes = this.notes;
            copy.document = this.document;
            copy.source = this.source;
            return copy;
        };

        return VesselNotes;
    });
