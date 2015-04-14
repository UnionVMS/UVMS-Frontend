angular.module('unionvmsWeb')
    .factory('MobileTerminal', function(CommunicationChannel, CarrierId, MobileTerminalAttribute) {

        var INMARSAT_C_ATTRIBUTES = ['SATELLITE_NUMBER', 'TRANSCEIVER_TYPE', 'SOFTWARE_VERSION', 'ANTENNA', 'ANSWER_BACK', 'INSTALLED_BY', 'INSTALLED_ON', 'STARTED_ON', 'UNINSTALLED_ON'];

        function MobileTerminal(){
            this.mobileTerminalId = {
                systemType : undefined,
                serialNumber : ""
            };
            this.attributes = {};
            this.channels = [];
            //Add an initial channel
            this.channels.push(new CommunicationChannel());

            this.active = true;
            this.carrierId = new CarrierId();
        }

        MobileTerminal.fromJson = function(data){
            var mobileTerminal = new MobileTerminal();

            //MobileTerminalId
            mobileTerminal.mobileTerminalId = {
                systemType : data.mobileTerminalId.systemType,
                serialNumber : data.mobileTerminalId.serialNumber
            };

            //CarrierId
            if(angular.isDefined(data.carrierId)){
                mobileTerminal.carrierId = CarrierId.fromJson(data.carrierId);
            }

            //Attributes
            if(data.attributes !== null){
            mobileTerminal.attributes = {};
                for (var i = 0; i < data.attributes.length; i ++) {
                    //mobileTerminal.attributes.push(MobileTerminalAttribute.fromJson(data.attributes[i]));
                    mobileTerminal.attributes[data.attributes[i].fieldType.toUpperCase()] = data.attributes[i].value;
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
            mobileTerminal.active = data.active;

            return mobileTerminal;

        };

        MobileTerminal.prototype.toJson = function(){
            //Create array of MobileTerminalAttributes
            var attributesObjects = [];
            var validAttributes;

            if(this.mobileTerminalId.systemType === 'INMARSAT_C'){
                validAttributes = INMARSAT_C_ATTRIBUTES;
            }

            $.each(this.attributes, function(key, value){
                if(validAttributes.indexOf(key) >= 0){
                    attributesObjects.push(new MobileTerminalAttribute(key, value));
                }
            });

            //Create array of Channels in json format
            var jsonChannels = [];
            $.each(this.channels, function(index, value){
                var channelObject = JSON.parse(value.toJson());
                jsonChannels.push(channelObject);
            });

            if(angular.isDefined(this.carrierId) && angular.isDefined(this.carrierId.value)){
                return JSON.stringify({
                    mobileTerminalId : {
                        systemType : this.mobileTerminalId.systemType,
                        serialNumber : this.mobileTerminalId.serialNumber,
                    },
                    carrierId : this.carrierId,
                    attributes : attributesObjects,
                    channels : jsonChannels,
                    active : this.active
                });
            } else{
                return JSON.stringify({
                    mobileTerminalId : {
                        systemType : this.mobileTerminalId.systemType,
                        serialNumber : this.mobileTerminalId.serialNumber,
                    },
                    attributes : attributesObjects,
                    channels : jsonChannels,
                    active : this.active
                });
            }
        };

        MobileTerminal.prototype.setSystemTypeToInmarsatC = function(){
            this.mobileTerminalId.systemType = "INMARSAT_C";

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

        return MobileTerminal;
    });
