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
angular.module('unionvmsWeb')
.factory('VesselContact', function() {

        function VesselContact(){
            this.name = undefined;
            this.number = undefined;
            this.email = undefined;
            this.owner = undefined;
            this.source = undefined;
        }

        VesselContact.fromDTO = function(data){
            var contact = new VesselContact();
            contact.name = data.name;
            contact.number = data.number;
            contact.email = data.email;
            contact.owner = data.owner;
            contact.source = data.source;
            return contact;
        };

        VesselContact.prototype.copy = function() {
            var copy = new VesselContact();
            copy.name = this.name;
            copy.number = this.number;
            copy.email = this.email;
            copy.owner = this.owner;
            copy.source = this.source;
            return copy;
        };

        return VesselContact;
    });
