angular.module('unionvmsWeb').factory('loadingStatus',function() {
	var loadings = {
			isLoadingPreferences: {
					message: 'spatial.loading_preferences',
					value: false
			}
	};
	
	var loadingStatus = {
			isLoading : function(type, newVal) {
				if(angular.isDefined(newVal)){
					loadings['isLoading' + type ].value = newVal;
				}
				return loadings['isLoading' + type ].value;
			},
			message : function(type) {
				return loadings['isLoading' + type ].message;
			}
	};

	return loadingStatus;
});