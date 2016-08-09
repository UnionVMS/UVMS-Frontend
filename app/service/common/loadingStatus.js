angular.module('unionvmsWeb').factory('loadingStatus',function() {
	var loadings = {
		Preferences: {
			message: ['spatial.loading_preferences', 'spatial.reseting_preferences', 'spatial.saving_preferences'], 
			value: false,
			counter: 0
		},
		InitialReporting: {
		    message: 'spatial.map_loading_report_message',
		    value: false,
		    counter: 0
		},
		LiveviewMap: {
		    message: ['spatial.map_loading_report_message', 'spatial.map_loading_alarms_message', 'spatial.loading_data', 'spatial.processing', 'spatial.map_saving_report_message'],
            value: false,
            counter: 0
		},
		SaveReport: {
			message: 'spatial.saving_report_message',
            value: false,
            counter: 0
		},
		ResetReport: {
			message: 'spatial.reseting_report_message',
            value: false,
            counter: 0
		},
		SearchReferenceData: {
		    message: 'spatial.loading_data',
            value: false,
            counter: 0
		},
		AreaSelectionFieldset: {
		    message: 'spatial.loading_data',
            value: false,
            counter: 0
		},
		EditAreaGroupModal: {
		    message: 'spatial.loading_data',
            value: false,
            counter: 0
		},
		AreaManagement: {
		    message: ['areas.inital_loading','areas.getting_attributes_to_map','areas.saving_system_area','areas.getting_area','areas.saving_new_area','areas.updating_area','areas.deleting_area','areas.uploading_message','areas.updating_metadata','areas.getting_area_metadata','areas.checking_dataset','areas.creating_dataset'],
            value: false,
            counter: 0
		},
		AreaManagementPanel: {
		    message: 'areas.inital_loading',
            value: false,
            counter: 0
		}
	};
	
	var loadingStatus = {
		isLoading : function(type, newVal, messageIdx) {
			if(angular.isDefined(newVal)){
			    if (newVal){
			        loadings[ type ].counter += 1;
			        loadings[ type ].value = newVal;
			    } else {
			        if (loadings[ type ].counter > 0){
			            loadings[ type ].counter -= 1;
			        }
			        
			        if (loadings[ type ].counter === 0){
	                    loadings[ type ].value = newVal;
	                }
			    }
			}
			
			if (angular.isDefined(messageIdx)){
			    loadings[ type ].messageIdx = messageIdx;
			}
			if (newVal === false && _.isArray(loadings[ type ].message)){
                loadings[ type ].messageIdx = undefined;
            }
			
			return loadings[ type ].value;
		},
		message : function(type) {
		    if (_.isArray(loadings[ type ].message)){
		        var idx = 0;
		        if (angular.isDefined(loadings[ type ].messageIdx)){
		            idx = loadings[ type ].messageIdx;
		        }
		        return loadings[ type ].message[idx];
		    } 
			return loadings[ type ].message;
		},
		resetState: function(){
		    angular.forEach(loadings, function(item){
		       item.value = false; 
		       item.counter = 0;
		    });
		}
	};

	return loadingStatus;
});