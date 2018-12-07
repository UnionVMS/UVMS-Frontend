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
            this.capabilities = {};
            this.defaultReporting = undefined;
            this.ids = {};
            this.name = "VMS"; // Default name
            this.guid = undefined;
            this.DNID = undefined;
            
            // ids
            this.frequencyGracePeriod = undefined;
            this.expectedFrequencyInPort = undefined;
            this.expectedFrequency = undefined;
            this.lesDescription = undefined;
            this.memberNumber = undefined;
            this.installedBy = undefined;
            this.installDate = undefined;
            this.uninstallDate = undefined;
            this.startDate = undefined;
            this.endDate = undefined;

            // channel types
            this.defaultChannel = true;
            this.configChannel = true;
            this.pollChannel = true;
        }

        function objectToTypeValueList(obj) {
            var list = [];
            $.each(obj, function(key, value) {
                if(angular.isDefined(value)){
                    list.push({"type": key, "value": value});
                }
            });

            return list;
        }

        CommunicationChannel.fromJson = function(data){
            var channel = new CommunicationChannel();
            channel.defaultReporting = data.defaultReporting;
            channel.name = data.name;
			channel.guid = data.guid;
            channel.DNID = data.DNID;
             // ids
             channel.frequencyGracePeriod = data.frequencyGracePeriod;
             channel.expectedFrequencyInPort = data.expectedFrequencyInPort;
             channel.expectedFrequency = data.expectedFrequency;
             channel.lesDescription = data.lesDescription;
             channel.memberNumber = data.memberNumber;
             channel.installedBy = data.installedBy;
             channel.installDate = data.installDate;
             channel.uninstallDate = data.uninstallDate;
             channel.startDate = data.startDate;
             channel.endDate = data.endDate;
 
             // channel types
             channel.defaultChannel = data.defaultChannel;
             channel.configChannel = data.configChannel;
             channel.pollChannel = data.pollChannel;

            //IdList
            if (angular.isArray(data.attributes)) {
                for (var i = 0; i < data.attributes.length; i++) {
                    var idType = data.attributes[i].type,
                        idValue = data.attributes[i].value;
                    channel.ids[idType] = idValue;
                }
            }

            if (angular.isArray(data.capabilities)) {
                for (var j = 0; j < data.capabilities.length; j++) {
                    var capability = data.capabilities[j];
                    channel.capabilities[capability.type] = capability.value;
                }
            }

            return channel;
        };

        CommunicationChannel.prototype.toJson = function(){
            return JSON.stringify(this.dataTransferObject());
        };

        CommunicationChannel.prototype.dataTransferObject = function() {
            return {
                attributes: objectToTypeValueList(this.ids),
                capabilities: objectToTypeValueList(this.capabilities),
                defaultReporting: this.defaultReporting,
                name : angular.isDefined(this.name) ? this.name : '',
                guid: this.guid,
                DNID : this.DNID,
                frequencyGracePeriod : dateTimeService.formatSecondsAsDuration(this.frequencyGracePeriod),
                expectedFrequencyInPort : dateTimeService.formatSecondsAsDuration(this.expectedFrequencyInPort),
                expectedFrequency : dateTimeService.formatSecondsAsDuration(this.expectedFrequency),
                lesDescription : this.lesDescription,
                memberNumber : this.memberNumber,
                installedBy : this.installedBy,
                installDate : this.installDate,
                uninstallDate : this.uninstallDate,
                startDate : this.startDate,
                endDate : this.endDate,
                defaultChannel : this.defaultChannel,
                configChannel : this.configChannel,
                pollChannel : this.pollChannel
            };
        };

        CommunicationChannel.prototype.copy = function() {
            var copy = new CommunicationChannel();
            copy.name = this.name;
            copy.defaultReporting = this.defaultReporting;
            copy.guid = this.guid;
                        
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

            for (var key in this.ids) {
                if (this.ids.hasOwnProperty(key)) {
                    copy.ids[key] = this.ids[key];
                }   
            }

            for (var k in this.capabilities) {
                if (this.capabilities.hasOwnProperty(k)) {
                    copy.capabilities[k] = this.capabilities[k];
                }
            }

            return copy;
        };

        CommunicationChannel.prototype.setLESDescription = function(description) {
            if(angular.isDefined(description)){
                this.lesDescription = description;
            }else{
                delete this.lesDescription;
            }
        };

        CommunicationChannel.prototype.getFormattedStartDate = function() {
            return moment(this.startDate, 'YYYY-MM-DD HH:mm').format("YYYY-MM-DD HH:mm Z");
        };

        CommunicationChannel.prototype.getFormattedStopDate = function() {
            return moment(this.endDate, 'YYYY-MM-DD HH:mm').format("YYYY-MM-DD HH:mm Z");
        };

        return CommunicationChannel;
    });