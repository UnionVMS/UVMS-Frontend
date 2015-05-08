angular.module('unionvmsWeb')
    .factory('MobileTerminalId', function() {

        function MobileTerminalId(){
            this.systemType = undefined;
            this.ids = {};
        }

        MobileTerminalId.fromJson = function(data){
            var mobileTerminalId = new MobileTerminalId();

            //MobileTerminalId
            mobileTerminalId.systemType = data.systemType;

            //IdList
            for (var i = 0; i < data.idList.length; i ++) {
                var idType = data.idList[i].type,
                    idValue = data.idList[i].value;
                mobileTerminalId.ids[idType] = idValue;
            }            

            return mobileTerminalId;
        };

        MobileTerminalId.prototype.dataTransferObject = function() {
            //Create idList
            var idList = [];
            $.each(this.ids, function(key, value){
                idList.push({"type": key, "value": value});
            });

            return {
                systemType : this.systemType,
                idList : idList,
            };
        };

        MobileTerminalId.prototype.toJson = function(){
            return JSON.stringify(this.dataTransferObject());
        };

        MobileTerminalId.prototype.setSystemTypeToInmarsatC = function(){
            this.systemType ='INMARSAT_C';
        };

        MobileTerminalId.prototype.isInmarsatC = function(){
            return this.systemType === 'INMARSAT_C';
        };

        return MobileTerminalId;
    });