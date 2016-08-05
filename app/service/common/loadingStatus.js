angular.module('unionvmsWeb').factory('loadingStatus',function() {
	var loadings = {
		isLoadingPreferences: {
			message: ['spatial.loading_preferences', 'spatial.reseting_preferences', 'spatial.saving_preferences'], 
			value: false
		},
		isLoadingLiveviewMap: {
		    message: ['spatial.map_loading_report_message', 'spatial.map_loading_alarms_message', 'spatial.loading_data', 'spatial.processing', 'spatial.map_saving_report_message'],
		    messageIdx: undefined,
            value: false
		},
		isLoadingSaveReport: {
			message: 'spatial.saving_report_message',
            value: false
		},
		isLoadingResetReport: {
			message: 'spatial.reseting_report_message',
            value: false
		},
		isLoadingSearchReferenceData: {
		    message: 'spatial.loading_data',
            value: false
		},
		isLoadingAreaSelectionFieldset: {
		    message: 'spatial.loading_data',
            value: false
		},
		isLoadingEditAreaGroupModal: {
		    message: 'spatial.loading_data',
            value: false
		},
		isLoadingAreaManagement: {
		    message: ['areas.inital_loading','areas.getting_attributes_to_map','areas.saving_system_area','areas.getting_area','areas.saving_new_area','areas.updating_area','areas.deleting_area'],
            value: false
		}
	};
	
	var loadingStatus = {
		isLoading : function(type, newVal, messageIdx) {
			if(angular.isDefined(newVal)){
				loadings['isLoading' + type ].value = newVal;
			}
			if (angular.isDefined(messageIdx)){
			    loadings['isLoading' + type ].messageIdx = messageIdx;
			}
			if (newVal === false && _.isArray(loadings['isLoading' + type ].message)){
                loadings['isLoading' + type ].messageIdx = undefined;
            }
			
			return loadings['isLoading' + type ].value;
		},
		message : function(type) {
		    if (_.isArray(loadings['isLoading' + type ].message)){
		        var idx = 0;
		        if (angular.isDefined(loadings['isLoading' + type ].messageIdx)){
		            idx = loadings['isLoading' + type ].messageIdx;
		        }
		        return loadings['isLoading' + type ].message[idx];
		    } 
			return loadings['isLoading' + type ].message;
		},
		resetState: function(){
		    angular.forEach(loadings, function(item){
		       item.value = false; 
		    });
		}
	};

	return loadingStatus;
});