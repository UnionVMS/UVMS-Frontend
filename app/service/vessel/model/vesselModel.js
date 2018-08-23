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
.factory('Vessel', function() {

    var SOURCE_INTERNAL = "INTERNAL";

    function Vessel(){
    	this.id = undefined;
    	this.historyId = undefined;
        this.active = true;
        this.cfr = null;
        this.imo = null;
        this.ircs = undefined;
        this.mmsi = null;
        this.gfcm = undefined;
        this.iccat = undefined;
        this.uvi = undefined;
        this.externalMarking = undefined;
        this.eventCode = undefined;
        this.flagStateCode = undefined;
        this.grossTonnage = null;
        this.grossTonnageUnit = "LONDON";
        this.portOfRegistration = undefined;
        this.lastMovement = undefined;
        this.lengthType = "LOA";
        this.lengthValue = null;
        this.licenseType = undefined;
        this.name = undefined;
        this.powerMain = null;
        this.gearFishingType = undefined;
        this.source = SOURCE_INTERNAL;
    }

    Vessel.fromJson = function(data){
        var vessel = new Vessel();

        vessel.id = data.id;
        vessel.historyId = data.historyId;
        vessel.source = data.source;
        vessel.active = data.active;
        vessel.name = data.name;
        vessel.flagStateCode = data.flagStateCode;
        vessel.ircs = data.ircs;
        vessel.cfr = data.cfr;
        vessel.mmsi = data.mmsi;
        vessel.imo = data.imo;
        vessel.gfcm = data.gfcm;
        vessel.iccat = data.iccat;
        vessel.uvi = data.uvi;
        vessel.externalMarking = data.externalMarking;
        vessel.portOfRegistration = data.portOfRegistration;

        vessel.licenseType = data.licenseType;

        vessel.gearFishingType = data.gearFishingType;
        //Set length value and type
        if(angular.isDefined(data.lengthBetweenPerpendiculars) && data.lengthBetweenPerpendiculars != null){
            vessel.lengthValue = data.lengthBetweenPerpendiculars;
            vessel.lengthType = "LBP";
        }else{
            vessel.lengthValue = data.lengthOverAll;
            vessel.lengthType = "LOA";
        }
        vessel.powerMain = data.powerOfMainEngine;
        vessel.grossTonnage = data.grossTonnage;
        vessel.grossTonnageUnit = data.grossTonnageUnit;
        vessel.eventCode = data.eventCode;
        vessel.updateTime = data.updateTime;

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
        	id : this.id,
        	historyId : this.historyId,
            active : this.active,
            source : this.source,
            cfr : this.cfr,
            name : this.name,
            flagStateCode : this.flagStateCode,
            imo : this.imo,
            externalMarking : this.externalMarking,
            ircsIndicator : this.hasIrcs(),
            ircs : this.ircs,
            hasLicense : this.hasLicense(),
            licenseType : this.licenseType,
            portOfRegistration : this.portOfRegistration,
            lengthOverAll : lengthOverall,
            lengthBetweenPerpendiculars : lengthBetweenPerpendiculars,
            powerOfMainEngine : this.powerMain,
            gearFishingType : this.gearFishingType,
            grossTonnage : this.grossTonnage,
            grossTonnageUnit : this.grossTonnageUnit,
        };

        if (this.mmsi) {
            // Do not send empty string, or other falsy values in general.
            dto.mmsi = this.mmsi;
        }

        return dto;
    };

    Vessel.prototype.copy = function() {
        var copy = new Vessel();
        copy.active = this.active;
        copy.cfr = this.cfr;
        copy.flagStateCode = this.flagStateCode;

        copy.eventCode = this.eventCode;
        copy.updateTime = this.updateTime;
        
        copy.externalMarking = this.externalMarking;
        copy.grossTonnage = this.grossTonnage;
        copy.grossTonnageUnit = this.grossTonnageUnit;
        copy.ircs = this.ircs;
        copy.licenseType = this.licenseType;
        copy.portOfRegistration = this.portOfRegistration;
        copy.imo = this.imo;
        copy.lengthValue = this.lengthValue;
        copy.lengthType = this.lengthType;
        //copy.lengthOverAll = this.lengthOverAll;
        //copy.lengthBetweenPerpendiculars = this.lengthBetweenPerpendiculars;
        copy.mmsi = this.mmsi;
        copy.name = this.name;
        copy.powerMain = this.powerMain;
        copy.source = this.source;
        copy.id = this.id;
        copy.historyId = this.historyId;
        copy.gearFishingType = this.gearFishingType;

        return copy;
    };

    Vessel.prototype.getGuid = function() {
    	return this.id;
    };
    
    Vessel.prototype.getHistoryGuid = function() {
    	return this.historyId;
    };

    //Check if the vessel is equal to another vessel
    //Equal means same guid
    Vessel.prototype.equals = function(item) {
        return this.id === item.id;
    };

    Vessel.prototype.isLocalSource = function() {
        return this.source.toUpperCase() === SOURCE_INTERNAL;
    };

    Vessel.prototype.hasIrcs = function() {
        if(typeof this.ircs === 'string' && this.ircs.trim().length > 0){
            return true;
        }else{
            return false;
        }
    };

    Vessel.prototype.hasLicense = function() {
        return typeof this.licenseType === 'string' && this.licenseType.trim().length > 0;
    };

    return Vessel;
});
