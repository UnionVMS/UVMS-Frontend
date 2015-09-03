angular.module('unionvmsWeb').filter('transponderName', function(locale) {
	return function(input) {
        var name = input;
        //Lookup name in langugage file
        var localeName = locale.getString('mobileTerminal.transponderNameFilter_' +input);
        if(localeName.indexOf('%%KEY_NOT_FOUND%%') < 0){
            name = localeName;
        }
        
		return name; 
	};
});