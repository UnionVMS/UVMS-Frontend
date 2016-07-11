/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').factory('loadingStatus',function() {
	var loadings = {
		isLoadingPreferences: {
			message: 'spatial.loading_preferences',
			value: false
		},
		isLoadingSavePreferences: {
			message: 'spatial.saving_preferences',
			value: false
		},
		isLoadingResetPreferences: {
			message: 'spatial.reseting_preferences',
			value: false
		},
		isLoadingLiveviewMap: {
		    message: ['spatial.map_loading_report_message', 'spatial.map_loading_alarms_message'],
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
		isLoadingGetAttrToMap: {
			message: 'areas.getting_attributes_to_map',
            value: false
		},
		isLoadingSavingSystemArea: {
			message: 'areas.saving_system_area',
            value: false
		},
		isLoadingSearchReferenceData: {
		    message: 'spatial.loading_data',
            value: false
		},
		isLoadingAreaSelectionModal: {
		    message: 'spatial.loading_data',
            value: false
		},
		isLoadingEditAreaGroupModal: {
		    message: 'spatial.loading_data',
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