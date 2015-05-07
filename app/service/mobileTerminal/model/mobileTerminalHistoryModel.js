angular.module('unionvmsWeb')
    .factory('MobileTerminalHistory', function(CarrierId, CommunicationChannel) {

        function MobileTerminalHistory(){
            this.attributes = {};
            this.channels = [];
        }

        MobileTerminalHistory.fromJson = function(data){
            var i = 0;
            var history = new MobileTerminalHistory();
            history.eventCode = data.eventCode;
            history.changeDate = data.changeDate;
            history.comment = data.comments;
            
            if(data.carrier){
                history.carrierId = CarrierId.fromJson(data.carrier);
            }

            //Attributes
            if (angular.isDefined(data.attributes)){
                history.attributes = {};
                for (i = 0; i < data.attributes.length; i++) {
                    history.attributes[data.attributes[i].fieldType.toUpperCase()] = data.attributes[i].value;
                }
            }
 
           //Channel
            if (angular.isDefined(data.channels)){
                for (i = 0; i < data.channels.length; i++) {
                    history.channels.push(CommunicationChannel.fromJson(data.channels[i]));
                }

                if(history.channels.length > 1){
                    history.channels.sort(function (obj1, obj2){
                        if (obj1.order !== undefined && obj2.order !== undefined){
                            return obj1.order - obj2.order;
                        } else {
                            return;
                        }
                    });
                }
            }
            return history;
        };

        return MobileTerminalHistory;
    });
