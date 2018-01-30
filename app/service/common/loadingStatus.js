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
/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name loadingStatus
 * @attr {Object} loadings - A property object with the status of all available loading messages
 * @description
 *  Service to manage all existent legendPanel(directive) in the application
 */
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
		},
		TripSummary: {
		    message: ['activity.trip_summary_loading', 'activity.catch_details_loading','activity.catch_evolution_loading'],
            value: false,
            counter: 0
		},
		FishingActivity: {
		    message: ['spatial.loading_data', 'activity.downloading_view'],
		    value: false,
		    counter: 0
		},
		MdrSettings: {
		    message: 'activity.mdr_settings_loading',
            value: false,
            counter: 0
		}
	};
	
	var loadingStatus = {
		/**
		 * Get or set the status of a specific loadingPanel
		 * 
		 * @memberof loadingStatus
		 * @public
		 * @param {String} type
		 * @param {Boolean} newVal
		 * @param {Number} messageIdx
		 * @returns {Boolean} If loadingPanel is visible
		 */
		isLoading : function(type, newVal, messageIdx) {
			//if newVal is defined this function is used as a setter, if not, it's a getter
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
		/**
		 * Get the current message of a specific type of loading
		 * 
		 * @memberof loadingStatus
		 * @public
		 * @param {String} type
		 * @returns {String} loading message
		 */
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
		/**
		 * Reset all the loadings status
		 * 
		 * @memberof loadingStatus
		 * @public
		 */
		resetState: function(){
		    angular.forEach(loadings, function(item){
		       item.value = false; 
		       item.counter = 0;
		    });
		}
	};

	return loadingStatus;
});