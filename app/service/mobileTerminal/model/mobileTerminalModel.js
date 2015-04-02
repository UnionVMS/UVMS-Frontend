angular.module('unionvmsWeb')
    .factory('MobileTerminal', function(CommunicationChannel) {

        function MobileTerminal(data){
            this.terminalId = data.terminalId;
            this.transponderSystem = data.transponderSystem;
            this.vesselId = data.vesselId;
            this.communicationChannels = [];

            for (var i = 0; i < data.communicationChannels.length; i ++) {
                this.communicationChannels.push(new CommunicationChannel(data.communicationChannels[i]));
            }
        }

        MobileTerminal.prototype.toJson = function(){
            return JSON.stringify({
                terminalId : this.terminalId,
                transponderSystem : this.transponderSystem,
                vesselId : this.vesselId,
                communicationChannels : this.communicationChannels
            });
        };

        MobileTerminal.prototype.getVesselId = function() {
            return this.vesselId;
        };

        MobileTerminal.prototype.getTransponderSystem = function(){
            return this.transponderSystem;
        };

        return MobileTerminal;
    });
