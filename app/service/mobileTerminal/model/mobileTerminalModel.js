angular.module('unionvmsWeb').factory('MobileTerminal', function(CommunicationChannel) {

        function MobileTerminal(){
            this.attributes = {};

            //Add an initial channel
            var defaultChannel = new CommunicationChannel();
            defaultChannel.capabilities = {
                "CONFIGURABLE": true,
                "DEFAULT_REPORTING": true,
                "POLLABLE": true
            };

            this.channels = [defaultChannel];
            this.active = true;
            this.connectId = undefined;
            this.associatedVessel = undefined;
            this.guid = undefined;
            this.type = undefined;
            this.plugin = {
                labelName : undefined,
                serviceName : undefined,
                inactive : false,
            };
        }

        MobileTerminal.fromJson = function(data){
            var mobileTerminal = new MobileTerminal();

            mobileTerminal.active = !data.inactive;
            mobileTerminal.guid = data.mobileTerminalId.guid;
            mobileTerminal.source = data.source;
            mobileTerminal.type = data.type;
            mobileTerminal.connectId = data.connectId;

            if(angular.isDefined(data.plugin)){
                mobileTerminal.plugin = {
                    labelName : data.plugin.labelName,
                    serviceName : data.plugin.serviceName,
                    inactive : data.plugin.inactive
                };
            }

            //Attributes
            if (data.attributes !== null) {
                mobileTerminal.attributes = {};
                for (var i = 0; i < data.attributes.length; i++) {
                    var value = data.attributes[i].value;
                    if (angular.isDefined(value) && String(value).trim().length > 0){
                        var key = data.attributes[i].type.toUpperCase();
                        //If MULTIPLE_OCEAN the attribute should be a list
                        if(key === "MULTIPLE_OCEAN"){
                            if(angular.isDefined(mobileTerminal.attributes[key])){
                                mobileTerminal.attributes[key].push(value);
                            }else{
                                mobileTerminal.attributes[key] = [value];
                            }
                        }
                        else if (key === "FREQUENCY_EXPECTED" || key === "FREQUENCY_GRACE_PERIOD" || key === "FREQUENCY_IN_PORT") {
                            mobileTerminal.attributes[key] = Number(value);
                        } else {
                            mobileTerminal.attributes[key] = value;
                        }
                    }
                }
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

        MobileTerminal.prototype.dataTransferObject = function() {
            //Create array of attributes
            var attributesObjects = [];
            $.each(this.attributes, function(key, value){
                if(angular.isDefined(value) && String(key).trim().length > 0 && String(value).trim().length > 0){
                    //Value is an array of values?
                    if(_.isArray(value)){
                        $.each(value, function(i, listItem){
                            attributesObjects.push({"type": key, "value": listItem});
                        });
                    }
                    //Single value
                    else{
                        attributesObjects.push({"type": key, "value": value});
                    }
                }
            });

            //Create array of Channels in json format
            var jsonChannels = [];
            $.each(this.channels, function(index, value){
                var channelObject = JSON.parse(value.toJson());
                jsonChannels.push(channelObject);
            });

            return {
                attributes : attributesObjects,
                channels : jsonChannels,
                mobileTerminalId : { guid: this.guid },
                type : this.type,
                plugin : this.plugin
            };
        };

        MobileTerminal.prototype.toJson = function(){
            return JSON.stringify(this.dataTransferObject());
        };

        MobileTerminal.prototype.copy = function() {
            var copy = new MobileTerminal();
            copy.active = this.active;
            copy.associatedVessel = this.associatedVessel;
            copy.source = this.source;
            for (var key in this.attributes) {
                if (this.attributes.hasOwnProperty(key)) {
                    copy.attributes[key] = this.attributes[key];
                }
            }

            copy.type = this.type;
            copy.plugin = this.plugin;
            copy.guid = this.guid;
            copy.connectId = this.connectId;
            copy.channels = this.channels.map(function(ch) {
                return ch.copy();
            });


            return copy;
        };

        //Used when activating, inactivating and removing
        MobileTerminal.prototype.toSetStatusJson = function() {
            return JSON.stringify({ guid: this.guid });
        };

        MobileTerminal.prototype.getCarrierAssingmentDto = function(connectId) {
            return {
                mobileTerminalId: { guid: this.guid },
                connectId: connectId
            };
        };

        MobileTerminal.prototype.toAssignJson = function(connectId){
            return JSON.stringify(this.getCarrierAssingmentDto(connectId));
        };

        MobileTerminal.prototype.toUnassignJson = function() {
            return JSON.stringify(this.getCarrierAssingmentDto(this.connectId));
        };

        MobileTerminal.prototype.setSystemTypeToInmarsatC = function(){
            this.type = 'INMARSAT_C';
        };

        //Add a new channel to the end of the list
        MobileTerminal.prototype.addNewChannel = function(){
            var newChannel = new CommunicationChannel();
            if(angular.isDefined(this.plugin.labelName)){
                newChannel.setLESDescription(this.plugin.labelName);
            }
            this.channels.push(newChannel);
        };

        MobileTerminal.prototype.transferCapabilitiesToDefaultChannel = function(removedChannels) {
            if (this.channels.length === 0) {
                return;
            }

            var defaultChannel = this.channels[0];
            $.each(removedChannels, function(index, removedChannel) {
                $.each(removedChannel.capabilities, function(capability, removedValue) {
                    defaultChannel.capabilities[capability] = defaultChannel.capabilities[capability] || removedValue;
                });
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

        //Set the attributes
        MobileTerminal.prototype.setAttributes = function(attributes){
            this.attributes = attributes;
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
            return this.attributes["SERIAL_NUMBER"];
        };

        MobileTerminal.prototype.getSystemType = function() {
            return this.type;
        };

        MobileTerminal.prototype.pluginIsInactive = function() {
            return angular.isDefined(this.plugin) && this.plugin.inactive;
        };

        MobileTerminal.prototype.isEqualTerminal = function(item) {
            if(item.guid === this.guid){
                return true;
            }else{
                return false;
            }
        };


        //Check if the list of attributes and channels are equal for this and another mobile terminal
        MobileTerminal.prototype.isEqualAttributesAndChannels = function(other) {
            if (!other) {
                return false;
            }

            //Compare attributes
            if(!angular.equals(this.attributes, other.attributes)){
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