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
angular.module('unionvmsWeb').factory('spatialHelperService',function(userService) {

	var spServ = {
	    defaultReports: [],
	    roleName: undefined,
	    tbControl: {
	        measure: false,
	        fullscreen: false,
	        print: false,
	        mapFishPrint: false,
	        bookmarks: false,
	        newTab: true
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
	    },
        fromFAView: false
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
        if (!angular.isDefined(spServ.roleName) || spServ.roleName !== context.role.roleName){
            spServ.roleName = context.role.roleName;
            spServ.defaultReports = [];
        }
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

    spServ.deactivateFullscreen = function() {
        if(screenfull.isFullscreen){
            screenfull.exit();
        }
    };

    spServ.configureFullscreenModal = function(modalInstance) {
        modalInstance.rendered.then(function(){
            $('body > .modal[uib-modal-window="modal-window"]').not($('.alert-modal-content')).appendTo('#map');
            $('[uib-modal-backdrop="modal-backdrop"]').not($('.alert-modal-backdrop')).appendTo('#map');
        });
    };

	return spServ;
});
