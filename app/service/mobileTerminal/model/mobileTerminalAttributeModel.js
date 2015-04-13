angular.module('unionvmsWeb')
.factory('MobileTerminalAttribute', function(EventHistory) {

        function MobileTerminalAttribute(fieldType, value){
            this.fieldType = fieldType;
            this.value = value;            
        }

        MobileTerminalAttribute.fromJson = function(data){
            var mobileTerminalAttribute = new MobileTerminalAttribute(data.fieldType, data.value);
            return mobileTerminalAttribute;
        };

        MobileTerminalAttribute.prototype.toJson = function(){
            return JSON.stringify({
                fieldType : this.fieldType,
                value : this.value,
            });
        };

        return MobileTerminalAttribute;
    });