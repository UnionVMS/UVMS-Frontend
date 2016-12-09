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
angular.module('unionvmsWeb').factory('CommunicationChannel', function() {

        //Create a new channel with the default type "VMS"
        function CommunicationChannel(){
            this.capabilities = {};
            this.defaultReporting = undefined;
            this.ids = {};
            this.name = "VMS"; // Default name
            this.guid = undefined;
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
				guid: this.guid
            };
        };

        CommunicationChannel.prototype.copy = function() {
            var copy = new CommunicationChannel();
            copy.name = this.name;
            copy.defaultReporting = this.defaultReporting;
			copy.guid = this.guid;
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
                this.ids.LES_DESCRIPTION = description;
            }else{
                delete this.ids.LES_DESCRIPTION;
            }
        };

        CommunicationChannel.prototype.getFormattedStartDate = function() {
            return moment(this.ids["START_DATE"], 'YYYY-MM-DD HH:mm').format("YYYY-MM-DD HH:mm Z");
        };

        CommunicationChannel.prototype.getFormattedStopDate = function() {
            return moment(this.ids["STOP_DATE"], 'YYYY-MM-DD HH:mm').format("YYYY-MM-DD HH:mm Z");
        };

        return CommunicationChannel;
    });