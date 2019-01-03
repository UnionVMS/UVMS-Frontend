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
angular.module('unionvmsWeb').factory('CommunicationChannel', function(dateTimeService) {

        //Create a new channel with the default type "VMS"
        function CommunicationChannel(){            
            this.name = "VMS"; // Default name
            this.id = undefined;
            this.DNID = undefined;
            
            // ids
            this.frequencyGracePeriod = 0;
            this.expectedFrequencyInPort = 0;
            this.expectedFrequency = 0;
            this.lesDescription = undefined;
            this.memberNumber = undefined;
            this.installedBy = undefined;
            this.installDate = undefined;
            this.uninstallDate = undefined;
            this.startDate = undefined;
            this.endDate = undefined;
            this.archived = false;

            // channel types
            this.defaultChannel = true;
            this.configChannel = true;
            this.pollChannel = true;
        }

        CommunicationChannel.fromJson = function(data){
            var channel = new CommunicationChannel();
            channel.name = data.name;
			channel.id = data.id;
            channel.DNID = data.DNID;
            // ids
            channel.frequencyGracePeriod = data.frequencyGracePeriod;
            channel.expectedFrequencyInPort = data.expectedFrequencyInPort;
            channel.expectedFrequency = data.expectedFrequency;
            channel.lesDescription = data.lesDescription;
            channel.memberNumber = data.memberNumber;
            channel.installedBy = data.installedBy;
            channel.installDate = channel.getFormattedDate(data.installDate);
            channel.uninstallDate = channel.getFormattedDate(data.uninstallDate);
            channel.startDate = channel.getFormattedDate(data.startDate);
            channel.endDate = channel.getFormattedDate(data.endDate);

            channel.archived = false;

            // channel types
            channel.defaultChannel = data.defaultChannel;
            channel.configChannel = data.configChannel;
            channel.pollChannel = data.pollChannel;
                        
            return channel;
        };

        CommunicationChannel.prototype.toJson = function(){
            return JSON.stringify(this.dataTransferObject());
        };

        CommunicationChannel.prototype.dataTransferObject = function() {            
            var dataTransferObject = {
                name : angular.isDefined(this.name) ? this.name : '',
                id: this.id,
                DNID : this.DNID,
                frequencyGracePeriod : this.frequencyGracePeriod,
                expectedFrequencyInPort : this.expectedFrequencyInPort,
                expectedFrequency : this.expectedFrequency,
                lesDescription : this.lesDescription,
                memberNumber : this.memberNumber,
                installedBy : this.installedBy,
                installDate : dateTimeService.formatISO8601(this.installDate),
                uninstallDate : dateTimeService.formatISO8601(this.uninstallDate),
                startDate : dateTimeService.formatISO8601(this.startDate),
                endDate : dateTimeService.formatISO8601(this.endDate),
                archived : this.archived,
                defaultChannel : this.defaultChannel,
                configChannel : this.configChannel,
                pollChannel : this.pollChannel
            };
            
            return dataTransferObject;
        };

        CommunicationChannel.prototype.copy = function() {
            var copy = new CommunicationChannel();
            copy.name = this.name;
            copy.id = this.id;
                        
            // ids
            copy.frequencyGracePeriod = this.frequencyGracePeriod;
            copy.expectedFrequencyInPort = this.expectedFrequencyInPort;
            copy.expectedFrequency = this.expectedFrequency;
            copy.lesDescription = this.lesDescription;
            copy.memberNumber = this.memberNumber;
            copy.installedBy = this.installedBy;
            copy.installDate = this.installDate;
            copy.uninstallDate = this.uninstallDate;
            copy.startDate = this.startDate;
            copy.endDate = this.endDate;
            
            // channel types
            copy.defaultChannel = this.defaultChannel;
            copy.configChannel = this.configChannel;
            copy.pollChannel = this.pollChannel;

            return copy;
        };

        CommunicationChannel.prototype.setLESDescription = function(description) {
            if(angular.isDefined(description)){
                this.lesDescription = description;
            }else{
                delete this.lesDescription;
            }
        };

        CommunicationChannel.prototype.getFormattedDate = function(date) 
        {
            if (date === undefined || date === null) {
                return date;
            }
            return moment(date, 'YYYY-MM-DDTHH:mm:ssZ').format("YYYY-MM-DD HH:mm:ss Z");
        };

        CommunicationChannel.prototype.getFormattedStartDate = function() {
            return moment(this.startDate, 'YYYY-MM-DD HH:mm').format("YYYY-MM-DD HH:mm Z");
        };

        CommunicationChannel.prototype.getFormattedStopDate = function() {
            return moment(this.endDate, 'YYYY-MM-DD HH:mm').format("YYYY-MM-DD HH:mm Z");
        };

        return CommunicationChannel;
    });