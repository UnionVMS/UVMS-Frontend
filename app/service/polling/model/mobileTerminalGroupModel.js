angular.module('unionvmsWeb').factory('MobileTerminalGroup', function() {

    function MobileTerminalGroup() {
        this.name = "Unknown group";
        this.mobileTerminals = [];
	}    
	
    return MobileTerminalGroup;
});