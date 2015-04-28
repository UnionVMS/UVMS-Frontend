angular.module('unionvmsWeb').factory('MobileTerminalGroup', function() {

    function MobileTerminalGroup() {
        this.name = "Unknown group";
        this.mobileTerminals = [];
	}    

    MobileTerminalGroup.fromJson = function(data){
        return new MobileTerminalGroup();
    };

    return MobileTerminalGroup;
});