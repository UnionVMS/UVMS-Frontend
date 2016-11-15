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
//	          catchDetails : undefined
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

	var reportingNavigatorService = {
		goToView: function(sectionTo,panelTo,callback,params) {
		    if (currentState.section !== sectionTo || currentState.panel !== panelTo){
		        previousState = angular.copy(currentState);
	            currentState = {
	                section: sectionTo,
	                panel: panelTo
	            };
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