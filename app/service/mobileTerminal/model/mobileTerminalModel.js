angular.module('unionvmsWeb')
    .factory('MobileTerminal', function(MobileTerminalId, CommunicationChannel, CarrierId) {

        var INMARSAT_C_ATTRIBUTES = ['SATELLITE_NUMBER', 'TRANSCEIVER_TYPE', 'SOFTWARE_VERSION', 'ANTENNA', 'ANSWER_BACK', 'INSTALLED_BY', 'INSTALLED_ON', 'STARTED_ON', 'UNINSTALLED_ON'];

        function MobileTerminal(){
            this.mobileTerminalId = new MobileTerminalId();
            this.attributes = {};
            this.channels = [];
            //Add an initial channel
            this.channels.push(new CommunicationChannel(1));
            this.active = true;
            this.carrierId = undefined;
            this.associatedVessel = undefined;
        }

        MobileTerminal.fromJson = function(data){
            var mobileTerminal = new MobileTerminal();

            //MobileTerminalId
            mobileTerminal.mobileTerminalId = MobileTerminalId.fromJson(data.mobileTerminalId); 

            //CarrierId
            if(angular.isDefined(data.carrierId)){
                mobileTerminal.carrierId = CarrierId.fromJson(data.carrierId);
            }

            //Attributes
            if(data.attributes !== null){
                mobileTerminal.attributes = {};
                for (var i = 0; i < data.attributes.length; i ++) {
                    var value = data.attributes[i].value;
                    if(angular.isDefined(value) && String(value).trim().length > 0){
                        mobileTerminal.attributes[data.attributes[i].fieldType.toUpperCase()] = value;
                    }
                }
            }

            //Channels
            if(data.channels !== null) {
                mobileTerminal.channels = [];
                for (var idx = 0; idx < data.channels.length; idx++) {
                    mobileTerminal.channels.push(CommunicationChannel.fromJson(data.channels[idx]));
                }
                //sortchannels by order
                if(mobileTerminal.channels.length > 1){
                    mobileTerminal.channels.sort(function (obj1, obj2){
                        if (obj1.order !== undefined && obj2.order !== undefined){
                            return obj1.order - obj2.order;
                        } else {
                            return;
                        }
                    });
                }
            }

            //Active
            mobileTerminal.active = !data.inactive;

            //Source
            mobileTerminal.source = data.source;

            return mobileTerminal;

        };

        MobileTerminal.prototype.toJson = function(){
            //Create array of attributes
            var attributesObjects = [];
            var validAttributes;

            if(this.mobileTerminalId.isInmarsatC()){
                validAttributes = INMARSAT_C_ATTRIBUTES;
            }

            $.each(this.attributes, function(key, value){
                if(validAttributes.indexOf(key) >= 0 && angular.isDefined(value) && String(value).trim().length > 0){
                    attributesObjects.push({"fieldType": key, "value": value});
                }
            });

            //Create array of Channels in json format
            var jsonChannels = [];
            $.each(this.channels, function(index, value){
                var channelObject = JSON.parse(value.toJson());
                jsonChannels.push(channelObject);
            });

            return JSON.stringify({
                mobileTerminalId : JSON.parse(this.mobileTerminalId.toJson()),
                attributes : attributesObjects,
                channels : jsonChannels
            });
        };

        //Used when activating, inactivating and removing
        MobileTerminal.prototype.toSetStatusJson = function(){
            return this.mobileTerminalId.toJson();
        };     

        //Used when assigning and unassigning
        MobileTerminal.prototype.toAssignJson = function(carrierId){
            //Create idList
            var idList = [];
            $.each(this.mobileTerminalId.ids, function(key, value){
                idList.push({"type": key, "value": value});
            });

            return JSON.stringify({
                mobileTerminalId : {
                    systemType : this.mobileTerminalId.systemType,
                    idList : idList,
                },
                carrierId : carrierId
            });
        };        

        //Used when assigning and unassigning
        MobileTerminal.prototype.toUnassignJson = function(){
            //Create idList
            var idList = [];
            $.each(this.mobileTerminalId.ids, function(key, value){
                idList.push({"type": key, "value": value});
                });

            return JSON.stringify({
                mobileTerminalId : {
                    systemType : this.mobileTerminalId.systemType,
                    idList : idList,
                },
                carrierId : this.carrierId
            });
        };

        MobileTerminal.prototype.toCreatePoll = function() {
            return {
                mobileTerminal: this.mobileTerminalId.dataTransferObject(),
                comChannel: this.channels[0].dataTransferObject()
            };
        };

        MobileTerminal.prototype.setSystemTypeToInmarsatC = function(){
            this.mobileTerminalId.setSystemTypeToInmarsatC();

            //TODO: Is this neeeded? /Gustav
            this.oceanRegion = undefined;
            this.satteliteNumber = undefined;
            this.serialNumber = undefined;
            this.transceiverType = undefined;
            this.softwareVersion = undefined;
            this.antenna = undefined;
            this.answerBack = undefined;
            this.installedBy = undefined;
            this.installedOn = undefined;
            this.startedOn = undefined;
            this.uninstalledOn = undefined;
            this.landEarthStation = undefined;
            this.expectedRepFreq = undefined;
            this.gracePeriod = undefined;
            this.inPortGracePeriod = undefined;
        };

        //Add a new channel to the end of the list
        MobileTerminal.prototype.addNewChannel = function(){
            this.channels.push(new CommunicationChannel(this.channels.length + 1));
        };

        //Add a new channel to the end of the list
        MobileTerminal.prototype.addNewChannel = function(){
            this.channels.push(new CommunicationChannel(this.channels.length + 1));
        };

        //Unassign the mobileTerminal from its carrier
        MobileTerminal.prototype.unassign = function(){
            this.carrierId = undefined;
            this.associatedVessel = undefined;
        };

        //Check if the mobileTerminal is assigned to a carrier
        MobileTerminal.prototype.isAssigned = function(){
            return this.carrierId !== undefined && this.carrierId.value !== undefined;
        };

        //Assign the mobileTerminal to a vessel by internalId
        MobileTerminal.prototype.assignToVesselWithIrcs = function(ircs){
            this.carrierId = CarrierId.createVesselWithIrcs(ircs);
        };

        //Set the mobileTerminalId
        MobileTerminal.prototype.setMobileTerminalId = function(mobileTerminalId){
            this.mobileTerminalId = mobileTerminalId;
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
        
        MobileTerminal.prototype.hasInternalId = function() {
            return this.mobileTerminalId.ids.hasOwnProperty("INTERNAL_ID");
        };

        MobileTerminal.prototype.getSerialNumber = function() {
            return this.mobileTerminalId.ids["SERIAL_NUMBER"];
        };

         MobileTerminal.prototype.getSystemType = function() {
            return this.mobileTerminalId.systemType;
        };

        MobileTerminal.prototype.isEqualTerminal = function(item) {
            if(item.getSerialNumber() === this.getSerialNumber() && item.getSystemType() === this.getSystemType()){
                return true;
            }else{
                return false;
            }
        };

        return MobileTerminal;
    });