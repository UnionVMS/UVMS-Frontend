angular.module('unionvmsWeb')
    .factory('inmarsatC', function() {

        function InmarsatC(data){
            this.id = data.id;
            this.oceanRegion = data.oceanRegion;
            this.satteliteNumber = data.satteliteNumber;
            this.serialNumber = data.serialNumber;
            this.transceiverType = data.transceiverType;
            this.softwareVersion = data.softwareVersion;
            this.antenna = data.antenna;
            this.answerBack = data.answerBack;
            this.installedBy = data.installedBy;
            this.installedOn = data.installedOn;
            this.startedOn = data.startedOn;
            this.uninstalledOn = data.uninstalledOn;
            this.landEarthStation = data.landEarthStation;
            this.expectedRepFreq = data.expectedRepFreq;
            this.gracePeriod = data.gracePeriod;
            this.inPortGracePeriod = data.inPortGracePeriod;
            this.communicationChannels = [];

            for (var i = 0; i < data.communicationChannels.length; i ++) {
                var channel = [];
                channel.push(data.communicationChannels.order);
                channel.push(data.communicationChannels.name);
                channel.push(data.communicationChannels.endDate);
                channel.push(data.communicationChannels.startDate);
                this.communicationChannels.push(data.channel);
            };
        }

        InmarsatC.prototype.toJson = function(){
            return JSON.stringify({
                id : this.id,
                oceanRegion :this.oceanRegion,
                satteliteNumber : this.satteliteNumber,
                serialNumber : this.serialNumber,
                transceiverType : this.transceiverType,
                softwareVersion : this.softwareVersion,
                antenna : this.antenna,
                answerBack : this.answerBack,
                installedBy : this.installedBy,
                installedOn : this.installedOn,
                startedOn : this.startedOn,
                uninstalledOn : this.uninstalledOn,
                landEarthStation : this.landEarthStation,
                expectedRepFreq : this.expectedRepFreq,
                gracePeriod : this.gracePeriod,
                inPortGracePeriod : this.inPortGracePeriod,
                communicationChannels : this.communicationChannels
            });
        };


        //Returns all communicationchannels
        InmarsatC.prototype.getCommunicationChannels = function(){
            return this.communicationChannels;
        };

        //Adds a new empty communicationChannel
        InmarsatC.prototype.addNewCommunicationChannel = function(){
            var channel = [];
            channel.name = "";
            channel.order = "";
            channel.endDate = "";
            channel.startDate = "";
            this.communicationChannels.push(channel);
        };

        //TODO: Do we need this?
        InmarsatC.prototype.getFormattedstartedOnDate = function() {
            return moment(this.startedOn).format("YYYY-MM-DD");
        };

        //TODO: Do we need this?
        InmarsatC.prototype.uninstalledOnDate = function() {
            return moment(this.uninstalledOn).format("YYYY-MM-DD");
        };

        //TODO: Do we need this?
        InmarsatC.prototype.getCommunicationChannelName = function(){
            return this.name;
        };

        return InmarsatC;
    });
