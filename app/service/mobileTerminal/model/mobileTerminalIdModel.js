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

        MobileTerminalId.prototype.toJson = function(){
            //Create idList
            var idList = [];
            $.each(this.ids, function(key, value){
                idList.push({"type": key, "value": value});
            });

            return JSON.stringify({
                systemType : this.systemType,
                idList : idList,
            });
        };

        MobileTerminalId.prototype.setSystemTypeToInmarsatC = function(){
            this.systemType ='INMARSAT_C';
        };

        MobileTerminalId.prototype.isInmarsatC = function(){
            return this.systemType === 'INMARSAT_C';
        };

        return MobileTerminalId;
    });