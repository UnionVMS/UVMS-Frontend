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
.factory('VesselContact', function() {

        function VesselContact(){
        	this.id = undefined;
        	this.assetId = undefined;
        	this.type = undefined;
            this.name = undefined;
            this.nationality = undefined;
            this.phoneNumber = undefined;
            this.streetName = undefined;
            this.postalArea = undefined;
            this.postalOfficeBox = undefined;
            this.cityName = undefined;
            this.country = undefined;
            this.email = undefined;
            this.owner = undefined;
            this.source = undefined;
            this.updateTime = undefined;
            this.updatedBy = undefined;
        }

        VesselContact.fromJson = function(data){
            var contact = new VesselContact();
            contact.id = data.id;
            contact.assetId = data.assetId;
            contact.type = data.type;
            contact.name = data.name;
            contact.nationality = data.nationality;
            contact.phoneNumber = data.phoneNumber;
            contact.streetName = data.streetName;
            contact.postalArea = data.postalArea;
            contact.postalOfficeBox = data.postalOfficeBox;
            contact.cityName = data.cityName;
            contact.country = data.country;
            contact.email = data.email;
            contact.owner = data.owner;
            contact.source = data.source;
            contact.updateTime = data.updateTime;
            contact.updatedBy = data.updatedBy;
            return contact;
        };
        
        VesselContact.prototype.toJson = function() {
        	return JSON.stringify({
        		id : this.id,
        		assetId : this.assetId,
            	type : this.type,
                name : this.name,
                nationality : this.nationality,
                phoneNumber : this.phoneNumber,
                streetName : this.streetName,
                postalArea : this.postalArea,
                postalOfficeBox : this.postalOfficeBox,
                cityName : this.cityName,
                country : this.country,
                email : this.email,
                owner : this.owner,
                source : this.source,
                updateTime : this.updateTime,
                updatedBy : this.updatedBy
            });
        };

        VesselContact.prototype.copy = function() {
            var copy = new VesselContact();
            copy.id = this.id;
            copy.assetId = this.assetId;
        	copy.type = this.type;
            copy.name = this.name;
            copy.nationality = this.nationality;
            copy.phoneNumber = this.phoneNumber;
            copy.streetName = this.streetName;
            copy.postalArea = this.postalArea;
            copy.postalOfficeBox = this.postalOfficeBox;
            copy.cityName = this.cityName;
            copy.country = this.country;
            copy.email = this.email;
            copy.owner = this.owner;
            copy.source = this.source;
            copy.updateTime = this.updateTime;
            copy.updatedBy = this.updatedBy;
            return copy;
        };

        return VesselContact;
    });
