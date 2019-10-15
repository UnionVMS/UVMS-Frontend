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
angular.module('unionvmsWeb').factory('MobileTerminal', function(CommunicationChannel) {

        function MobileTerminal() {
            this.serialNo = undefined;
            this.satelliteNumber = undefined;
            this.antenna = undefined;
            this.transceiverType = undefined;
            this.softwareVersion = undefined;
            this.answerBack = undefined;
            this.channels = [createDefaultChannel()];            
            this.active = false;            
            this.connectId = undefined;
            this.associatedVessel = undefined;
            this.mobileTerminalType = undefined;
            this.archived = false;
            this.inactivated = undefined;
            this.createTime = undefined;
            this.updateTime = undefined;

            this.westAtlanticOceanRegion = false;
            this.eastAtlanticOceanRegion = false;
            this.indianOceanRegion = false;
            this.pacificOceanRegion = false;

            this.source = 1; // (Internal: 1, National: 2)
            this.plugin = {
                name : undefined,
                pluginServiceName : undefined,
                pluginInactive : false,
            };
        }

        function createDefaultChannel(){
            var defaultChannel = new CommunicationChannel();            
            defaultChannel.defaultChannel = true;
            defaultChannel.configChannel = true;
            defaultChannel.pollChannel = true;            
            return defaultChannel;
        }

        MobileTerminal.fromJson = function(data){
            var mobileTerminal = new MobileTerminal();

            mobileTerminal.active = data.active;
            mobileTerminal.inactivated = !data.active;
            mobileTerminal.id = data.id;
            mobileTerminal.source = data.source;
            mobileTerminal.mobileTerminalType = data.mobileTerminalType;
            mobileTerminal.connectId = data.assetId;
            mobileTerminal.asset = {
                id : this.connectId
            };
            mobileTerminal.archived = data.archived;
            mobileTerminal.serialNo = data.serialNo;
            mobileTerminal.satelliteNumber = data.satelliteNumber;
            mobileTerminal.answerBack = data.answerBack;
            mobileTerminal.antenna = data.antenna;
            mobileTerminal.transceiverType = data.transceiverType;
            mobileTerminal.softwareVersion = data.softwareVersion;
            mobileTerminal.createTime = data.createTime;
            mobileTerminal.updateTime = data.updateTime;

            mobileTerminal.westAtlanticOceanRegion = data.westAtlanticOceanRegion;
            mobileTerminal.eastAtlanticOceanRegion = data.eastAtlanticOceanRegion;
            mobileTerminal.indianOceanRegion = data.indianOceanRegion;
            mobileTerminal.pacificOceanRegion = data.pacificOceanRegion;

            if(angular.isDefined(data.plugin) && data.plugin){
                mobileTerminal.plugin = {
                    name : data.plugin.name,
                    pluginServiceName : data.plugin.pluginServiceName,
                    pluginInactive : data.plugin.pluginInactive
                };
            }

            //Channels
            if (data.channels !== null) {
                mobileTerminal.channels = [];
                for (var idx = 0; idx < data.channels.length; idx++) {
                    mobileTerminal.channels.push(CommunicationChannel.fromJson(data.channels[idx]));
                }
            }

            return mobileTerminal;
        };

        MobileTerminal.prototype.resetChannels = function() {
            this.channels = [createDefaultChannel()];
        };

        MobileTerminal.prototype.dataTransferObject = function() {

            //Create array of Channels in json format
            var jsonChannels = [];
            $.each(this.channels, function(index, value){
                var channelObject = value.dataTransferObject();
                jsonChannels.push(channelObject);
            });
        
            var returnObject = {
                serialNo: this.serialNo,
                satelliteNumber: this.satelliteNumber,
                antenna : this.antenna,
                transceiverType : this.transceiverType,
                softwareVersion : this.softwareVersion,
                answerBack : this.answerBack,
                archived : this.archived,
                channels : jsonChannels,                
                id : this.id !== undefined ? this.id : null,
                mobileTerminalType : this.mobileTerminalType,
                plugin : this.plugin,
                inactivated : !this.active,
                active : this.active,
                createTime : this.createTime,
                updateTime : this.updateTime,
                source : this.source,
                westAtlanticOceanRegion : this.westAtlanticOceanRegion,
                eastAtlanticOceanRegion : this.eastAtlanticOceanRegion,
                indianOceanRegion : this.indianOceanRegion,
                pacificOceanRegion : this.pacificOceanRegion
            };
            
            if (this.connectId !== undefined) {
                returnObject.asset = undefined;
                returnObject.asset = {
                    id : this.connectId
                };
            }

            return returnObject;
        };

        MobileTerminal.prototype.toJson = function(){
            return JSON.stringify(this.dataTransferObject());
        };

        MobileTerminal.prototype.copy = function() {
            var copy = new MobileTerminal();
            copy.serialNo = this.serialNo;
            copy.satelliteNumber = this.satelliteNumber;
            copy.antenna = this.antenna;
            copy.transceiverType = this.transceiverType;
            copy.softwareVersion = this.softwareVersion;
            copy.answerBack = this.answerBack;
            copy.westAtlanticOceanRegion = this.westAtlanticOceanRegion;
            copy.eastAtlanticOceanRegion = this.eastAtlanticOceanRegion;
            copy.indianOceanRegion = this.indianOceanRegion;
            copy.pacificOceanRegion = this.pacificOceanRegion;
            copy.active = this.active;
            copy.inactivated = this.inactivated;
            copy.associatedVessel = this.associatedVessel;
            copy.source = this.source;
            copy.mobileTerminalType = this.mobileTerminalType;
            copy.plugin = this.plugin;
            copy.id = this.id;
            copy.connectId = this.connectId;
            copy.asset = this.asset;
            copy.archived = this.archived;
            copy.createTime = this.createTime;
            copy.updateTime = this.updateTime;
            copy.source = this.source;
            copy.channels = this.channels.map(function(ch) {
                return ch.copy();
            });


            return copy;
        };

        //Used when activating, inactivating and removing
        MobileTerminal.prototype.toSetStatusJson = function() {
            return JSON.stringify({ id: this.id });
        };

        MobileTerminal.prototype.setSystemTypeToInmarsatC = function(){
            this.mobileTerminalType = 'INMARSAT_C';
        };

        //Add a new channel to the end of the list
        MobileTerminal.prototype.addNewChannel = function(){
            var newChannel = new CommunicationChannel();
            for (var i = 0; i < this.channels.length; i++) {
            	var channel = this.channels[i];
            	if (newChannel.defaultChannel) {
            		newChannel.defaultChannel = !channel.defaultChannel;
            	}
            	if (newChannel.configChannel) {
            		newChannel.configChannel = !channel.configChannel;
            	}
            	if (newChannel.pollChannel) {
            		newChannel.pollChannel = !channel.pollChannel;
            	}
            }
            this.channels.push(newChannel);
            return newChannel;
        };

        MobileTerminal.prototype.transferCapabilitiesToDefaultChannel = function(removedChannels) {
            if (this.channels.length === 0) {
                return;
            }

            var defaultChannel = this.channels[0];
            $.each(removedChannels, function(index, removedChannel) {
                defaultChannel.defaultChannel = defaultChannel.defaultChannel || removedChannel.defaultChannel;
                defaultChannel.configChannel = defaultChannel.configChannel || removedChannel.configChannel ;
                defaultChannel.pollChannel = defaultChannel.pollChannel || removedChannel.pollChannel;
            });
        };

        MobileTerminal.prototype.removeChannel = function(channelIndex) {
            var removedChannels = this.channels.splice(channelIndex, 1);
            this.transferCapabilitiesToDefaultChannel(removedChannels);
        };

        //Unassign the mobileTerminal from its carrier
        MobileTerminal.prototype.unassign = function(){
            this.connectId = undefined;
            this.associatedVessel = undefined;
        };

        //Check if the mobileTerminal is assigned to a carrier
        MobileTerminal.prototype.isAssigned = function(){
            return this.connectId !== undefined && typeof this.connectId === 'string' && this.connectId.trim().length > 0;
        };

        //Assign the mobileTerminal to a vessel by a vesselGuid
        MobileTerminal.prototype.assignToVesselByVesselGuid = function(connectId){
            this.connectId = connectId;
        };

        //Set the channels
        MobileTerminal.prototype.setChannels = function(channels){
            this.channels = channels;
        };

        //Set the active status
        MobileTerminal.prototype.setActive = function(active){
            this.active = active;
        };

        //Set associated vessel
        MobileTerminal.prototype.setAssociatedVessel = function(vessel){
            return this.associatedVessel = vessel;
        };

        MobileTerminal.prototype.getSerialNumber = function() {
            return this.serialNo;
        };

        MobileTerminal.prototype.getSystemType = function() {
            return this.mobileTerminalType;
        };

        MobileTerminal.prototype.pluginIsInactive = function() {
            return angular.isDefined(this.plugin) && this.plugin.pluginInactive;
        };

        MobileTerminal.prototype.isEqualTerminal = function(item) {
            if(item.id === this.id){
                return true;
            }else{
                return false;
            }
        };


        //Check if the list of attributes and channels are equal for this and another mobile terminal
        MobileTerminal.prototype.isEqualChannels = function(other) {
            if (!other) {
                return false;
            }

            //Compare channels length
            if(this.channels.length !== other.channels.length){
                return false;
            }

            //Compare channel objects
            for(var i=0; i<this.channels.length; i++){
                if(!angular.equals(this.channels[i].dataTransferObject(), other.channels[i].dataTransferObject())){
                    return false;
                }
            }

            return true;
        };

        return MobileTerminal;
    });
