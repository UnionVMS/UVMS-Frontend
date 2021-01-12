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
.factory('Vessel', function(EventHistory, VesselContact, VesselNotes) {

    var SOURCE_INTERNAL = "INTERNAL";

    function Vessel(){
        this.active = true;
        this.cfr = null;
        this.contact = [];
        this.externalMarking = undefined;
        this.grossTonnage = null;
        this.grossTonnageUnit = "LONDON";
        this.homePort = undefined;
        this.imo = null;
        this.uvi = null;
        this.ircs = undefined;
        this.lastMovement = undefined;
        this.lengthType = "LOA";
        this.lengthValue = null;
        this.licenseType = undefined;
        this.mmsiNo = null;
        this.name = undefined;
        this.notes = [];
        this.powerMain = null;
        this.producer = {
            id : undefined,
            code : null,
            name : undefined,
            address : undefined,
            zipcode : undefined,
            city : undefined,
            phone : undefined,
            mobile : undefined,
            fax : undefined
        };
        this.source = SOURCE_INTERNAL;
    }

    Vessel.fromJson = function(data){
        var vessel = new Vessel();
        var i;

        if(angular.isDefined(data.assetId)){
            vessel.vesselId = {
                guid : data.assetId.guid,
                type : data.assetId.type,
                value : data.assetId.value
            };
        }
        vessel.source = data.source;
        vessel.active = data.active;
        vessel.name = data.name;
        vessel.countryCode = data.countryCode;
        vessel.cfr = data.cfr;
        vessel.mmsiNo = data.mmsiNo;
        vessel.imo = data.imo;
        vessel.uvi = data.uvi;
        vessel.externalMarking = data.externalMarking;
        vessel.homePort = data.homePort;

        vessel.ircs = data.ircs;
        vessel.licenseType = data.licenseType;

        vessel.gearType = data.gearType;
        //Set length value and type
        if(angular.isDefined(data.lengthBetweenPerpendiculars) && data.lengthBetweenPerpendiculars != null){
            vessel.lengthValue = data.lengthBetweenPerpendiculars;
            vessel.lengthType = "LBP";
        }else{
            vessel.lengthValue = data.lengthOverAll;
            vessel.lengthType = "LOA";
        }
        vessel.powerMain = data.powerMain;
        vessel.grossTonnage = data.grossTonnage;
        vessel.grossTonnageUnit = data.grossTonnageUnit;

        if (data.notes) {
            for (i = 0; i < data.notes.length; i++) {
                vessel.notes.push(VesselNotes.fromDTO(data.notes[i]));
            }
        }
        if (data.contact) {
            for (i = 0; i < data.contact.length; i++) {
                vessel.contact.push(VesselContact.fromDTO(data.contact[i]));
            }
        }

        if(data.producer){
            vessel.producer.id = data.producer.id;
            vessel.producer.code = data.producer.code;
            vessel.producer.name = data.producer.name;
            vessel.producer.address = data.producer.address;
            vessel.producer.zipcode = data.producer.zipcode;
            vessel.producer.city = data.producer.city;
            vessel.producer.phone = data.producer.phone;
            vessel.producer.mobile = data.producer.mobile;
            vessel.producer.fax = data.producer.fax;
        }

        if (data.eventHistory) {
            vessel.eventHistory = EventHistory.fromDTO(data.eventHistory);
        }

        return vessel;
    };

    Vessel.prototype.toJson = function(){
        return JSON.stringify(this.DTO());
    };

    Vessel.prototype.DTO = function(){
        //Only set one of the lengths
        var lengthOverall, lengthBetweenPerpendiculars;
        if(this.lengthValue > 0){
            if(this.lengthType === 'LOA'){
                lengthOverall = this.lengthValue;
            }else if(this.lengthType === 'LBP'){
                lengthBetweenPerpendiculars = this.lengthValue;
            }
        }

        var dto = {
            active : this.active,
            source : this.source,
            cfr : this.cfr,
            name : this.name,
            countryCode : this.countryCode,
            imo : this.imo,
            uvi : this.uvi,
            externalMarking : this.externalMarking,
            hasIrcs : this.hasIrcs(),
            ircs : this.ircs,
            hasLicense : this.hasLicense(),
            licenseType : this.licenseType,
            homePort : this.homePort,
            lengthOverAll : lengthOverall,
            lengthBetweenPerpendiculars : lengthBetweenPerpendiculars,
            powerMain : this.powerMain,
            gearType : this.gearType,
            grossTonnage : this.grossTonnage,
            grossTonnageUnit : this.grossTonnageUnit,
            contact : this.contact,
            producer : this.producer,
            notes : this.notes
        };

        if (this.mmsiNo) {
            // Do not send empty string, or other falsy values in general.
            dto.mmsiNo = this.mmsiNo;
        }

        if(angular.isDefined(this.vesselId)){
            dto['assetId'] = {
                type : this.vesselId.type,
                value : this.vesselId.value
            };
        }

        return dto;
    };

    Vessel.prototype.copy = function() {
        var copy = new Vessel();
        var i;
        copy.active = this.active;
        copy.cfr = this.cfr;
        copy.countryCode = this.countryCode;
        if(this.eventHistory){
            copy.eventHistory = this.eventHistory.copy();
        }
        copy.externalMarking = this.externalMarking;
        copy.grossTonnage = this.grossTonnage;
        copy.grossTonnageUnit = this.grossTonnageUnit;
        copy.ircs = this.ircs;
        copy.licenseType = this.licenseType;
        copy.homePort = this.homePort;
        copy.imo = this.imo;
        copy.uvi = this.uvi;
        copy.lengthValue = this.lengthValue;
        copy.lengthType = this.lengthType;
        //copy.lengthOverAll = this.lengthOverAll;
        //copy.lengthBetweenPerpendiculars = this.lengthBetweenPerpendiculars;
        copy.mmsiNo = this.mmsiNo;
        copy.name = this.name;
        copy.powerMain = this.powerMain;
        copy.source = this.source;
        if(this.vesselId){
            copy.vesselId = {
                guid : this.vesselId.guid,
                type : this.vesselId.type,
                value : this.vesselId.value
            };
        }
        if(this.contact){
            for (i = 0; i < this.contact.length; i++) {
                copy.contact.push(this.contact[i].copy());
            }
        }
        if(this.producer){
            copy.producer = {
                id : this.producer.id,
                code : this.producer.code,
                name : this.producer.name,
                address : this.producer.address,
                zipcode : this.producer.zipcode,
                city : this.producer.city,
                phone : this.producer.phone,
                mobile : this.producer.mobile,
                fax : this.producer.fax
            };
        }
        copy.gearType = this.gearType;

        if(this.notes){
            for (i = 0; i < this.notes.length; i++) {
                copy.notes.push(this.notes[i].copy());
            }
        }
        return copy;
    };

    Vessel.prototype.getGuid = function() {
        if(angular.isDefined(this.vesselId)){
            return this.vesselId.guid;
        }
    };
    
    Vessel.prototype.getHistoryGuid = function() {
        if(angular.isDefined(this.eventHistory)){
            return this.eventHistory.eventId;
        }
    };

    //Check if the vessel is equal to another vessel
    //Equal means same guid
    Vessel.prototype.equals = function(item) {
        return this.getGuid() === item.getGuid();
    };

    Vessel.prototype.isLocalSource = function() {
        return this.source.toUpperCase() === SOURCE_INTERNAL;
    };

    Vessel.prototype.hasIrcs = function() {
        if(typeof this.ircs === 'string' && this.ircs.trim().length > 0){
            return 'Y';
        }else{
            return 'N';
        }
    };

    Vessel.prototype.hasLicense = function() {
        return typeof this.licenseType === 'string' && this.licenseType.trim().length > 0;
    };

    return Vessel;
});
