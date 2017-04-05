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
angular.module('unionvmsWeb').factory('reportingNavigatorService',function() {
    
//    For documentation purposes
//    var sections = {
//        reportPanel: {
//            reportForm : undefined,
//			  reportsList : undefined
//        },
//        userPreferences: undefined,
//        liveViewPanel: {
//            mapPanel : undefined,
//            vmsPanel: undefined
//        },
//		  tripsPanel: {
//            tripSummary : undefined,
//	          catchDetails : undefined,
//            catchEvolution : undefined 
//        }
//    }
    
	var previousState = {
		section: '',
		panel: ''
	};

	var currentState = {
		section: '',
		panel: ''
	};

    function callCallback(callback, params){
		if(angular.isDefined(callback)){
			currentState.callback = callback;
			if(angular.isDefined(params)){
				currentState.params = params;
				callback.apply(this, params);
			}else{
				callback();
			}
		}
	}
	var reportingNavigatorService = {
		goToView: function(sectionTo,panelTo,callback,params) {
		    if (currentState.section !== sectionTo || currentState.panel !== panelTo){
		        previousState = angular.copy(currentState);
	            currentState = {
	                section: sectionTo,
	                panel: panelTo
	            };
				callCallback(callback, params);  
		    }else{
				callCallback(callback, params);	
			}
		},
		goToPreviousView: function() {
			var auxState = angular.copy(currentState);
			currentState = angular.copy(previousState);
			previousState = angular.copy(auxState);

			if(angular.isDefined(currentState.callback)){
				if(angular.isDefined(currentState.params)){
					currentState.callback.apply(this, currentState.params);
				}else{
					currentState.callback();
				}
			}
		},
		goToSection: function(section,callback,params) {
			previousState = angular.copy(currentState);
			
			currentState = {
		        section: section,
		        panel: ''
		    };

			if(angular.isDefined(callback)){
				currentState.callback = callback;
				if(angular.isDefined(params)){
					currentState.params = params;
					callback.apply(this, params);
				}else{
					delete currentState.params;
					callback();
				}
			}else{
				delete currentState.callback;
			}
		},
		isViewVisible: function(panel) {
			return angular.isDefined(currentState.panel) && currentState.panel === panel; 
		},
		isSectionVisible: function(section) {
			return angular.isDefined(currentState.section) && currentState.section === section; 
		},
		getCurrentView:function(){
			return currentState.panel;
		},
		getCurrentSection:function(){
			return currentState.section;
		},
		addStateCallback: function(callback) {
			currentState.callback = callback;
		},
		rmStateCallback: function() {
			delete currentState.callback;
		},
		rmStateParams: function() {
			delete currentState.params;
		},
		clearNavigation: function() {
			previousState = {
				section: '',
				panel: ''
			};

			currentState = {
				section: '',
				panel: ''
			};
		},
		hasPreviousState: function() {
			if(previousState.section || previousState.panel){
				return true;
			}else{
				return false;
			}
		}
	};

	return reportingNavigatorService;
});