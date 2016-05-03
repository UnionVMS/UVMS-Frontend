angular.module('unionvmsWeb').factory('spatialHelperService',function(userService) {

	var spServ = {
	    defaultReports: [],
	    tbControl: {
	        measure: false,
	        fullscreen: false,
	        print: false,
	        mapFishPrint: false,
	        bookmarks: false
	    },
	    measure: {
	        units: 'm',
	        speed: undefined,
	        startDate: undefined,
	        disabled: false
	    },
	    buffer: {
	        isSelecting: false,
	        layer: 'vmspos',
	        units: 'm',
	        radius: undefined,
	        features: []
	    }
	};
	
	//Default reports
	var getDefaultReportFromUserService = function(context){
	    var finalObj;
        var userPref = context.preferences;
        if (angular.isDefined(userPref)){
            angular.forEach(userPref.preferences, function(obj) {
                if (obj.applicationName === 'Reporting' && obj.optionName === 'DEFAULT_REPORT_ID'){
                    finalObj = {
                        scopeName: context.scope.scopeName,
                        id: parseInt(obj.optionValue)
                    };
                    spServ.defaultReports.push(finalObj);
                }
            });
        }
        
        return finalObj;
    };
    
    spServ.getDefaultReport = function(useService){
        var context = userService.getCurrentContext();
        var defaultRep = _.findWhere(spServ.defaultReports, {scopeName: context.scope.scopeName});
        
        if (!angular.isDefined(defaultRep) && useService){
            defaultRep = getDefaultReportFromUserService(context);
        }
        
        return defaultRep;
    };
    
    spServ.setDefaultRep = function(id){
        var context = userService.getCurrentContext();
        var scopeObj = _.findWhere(spServ.defaultReports, {scopeName: context.scope.scopeName});
        
        if (!angular.isDefined(scopeObj)){
            spServ.defaultReports.push({
                scopeName: context.scope.scopeName,
                id: parseInt(id)
            });
        } else {
            scopeObj.id = parseInt(id);
        }
    };
    
    //Toolbar controls
	spServ.setToolbarControls = function(config){
	    for (var i = 0; i < config.map.tbControl.length; i++){
	        spServ.tbControl[config.map.tbControl[i].type] = true;
	    }
	};

	return spServ;
});