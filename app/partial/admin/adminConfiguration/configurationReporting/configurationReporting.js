angular.module('unionvmsWeb').controller('ConfigurationreportingCtrl',function($scope, locale, SpatialConfig, spatialConfigRestService, alertService, formService, $anchorScroll){
	$scope.isAdminConfig = true;
	$scope.save = function(){
    	if(_.keys($scope.configurationReportForm.$error).length === 0){
	        var finalConfig = $scope.configModel.forAdminConfigToJson($scope.configModel);
//	        var finalConfig =  {
//	        		"toolSettings": {
//	        		       "control": [
//	        		           {
//	        		               "type": "zoom"
//	        		           },
//	        		           {
//	        		               "type": "drag"
//	        		           },
//	        		           {
//	        		               "type": "scale"
//	        		           },
//	        		           {
//	        		               "type": "mousecoords"
//	        		           },
//	        		           {
//	        		               "type": "history"
//	        		           }
//	        		       ],
//	        		       "tbControl": [
//	        		           {
//	        		               "type": "measure"
//	        		           },
//	        		           {
//	        		               "type": "fullscreen"
//	        		           },
//	        		           {
//	        		               "type": "print"
//	        		           }
//	        		       ]
//	        		   },
//	        		  "systemSettings": {
//	        		     "geoserverUrl": "http://localhost:8080/geoserver/",
//	        		     "bingApiKey": "iouoiu987987oiui"
//	        		   },
//	        		   "stylesSettings": {
//	        		     "positions": {
//	        		       "attribute": "countryCode",
//	        		       "style": {
//	        		         "BLZ": "#BA9566"
//	        		       }
//	        		     },
//	        		     "segments": {
//	        		       "attribute": "speedOverGround",
//	        		       "style": {
//	        		         "0-2": "#1a9641"
//	        		       }
//	        		     }
//	        		   },
//	        		   "layerSettings": {
//	        		     "baseLayers": [
//	        		       {
//	        		         "serviceLayerId": "6"
//	        		       },
//	        		       {
//	        		         "serviceLayerId": "8"
//	        		       },
//	        		       {
//	        		         "serviceLayerId": "9"
//	        		       },
//	        		       {
//	        		         "serviceLayerId": "10"
//	        		       }
//	        		     ],
//	        		     "portLayers": [
//	        		       {
//	        		         "serviceLayerId": "4"
//	        		       }
//	        		     ],
//	        		     "additionalLayers": [
//	        		       {
//	        		         "serviceLayerId": "7"
//	        		       }
//	        		     ],
//	        		     "areaLayers": {
//	        		       "sysAreas": [
//	        		         {
//	        		           "serviceLayerId": "1"
//	        		         },
//	        		         {
//	        		           "serviceLayerId": "2"
//	        		         }
//	        		       ],
//	        		       "userAreas": {
//	        		         "serviceLayerId": "5",
//	        		         "areas": [
//	        		           {
//	        		             "gid": 1
//	        		           }
//	        		         ]
//	        		       }
//	        		     }
//	        		   },
//	        		   "mapSettings": {
//	        		     "refreshStatus": false,
//	        		     "scaleBarUnits": "nautical",
//	        		     "coordinatesFormat": "dd",
//	        		     "mapProjectionId": 1,
//	        		     "refreshRate": 1000,
//	        		     "displayProjectionId": 1
//	        		   },
//	        		   "visibilitySettings": {
//	        		     "positions": {
//	        		       "popup": [
//	        		         "fs"
//	        		       ],
//	        		       "labels": [
//	        		         "fs"
//	        		       ],
//	        		       "table": [
//	        		         "fs"
//	        		       ]
//	        		     },
//	        		     "segments": {
//	        		       "popup": [
//	        		         "fs"
//	        		       ],
//	        		       "labels": [
//	        		         "extMark"
//	        		       ],
//	        		       "table": [
//	        		         "extMark"
//	        		       ]
//	        		     },
//	        		     "tracks": {
//	        		       "table": [
//	        		         "fs"
//	        		       ]
//	        		     }
//	        		   }
//	        		 };
	        spatialConfigRestService.saveAdminConfigs(finalConfig).then(function(response){
	            alertService.showSuccessMessageWithTimeout(locale.getString('common.global_setting_save_success_message'));
	        }, function(error){
	            alertService.showErrorMessageWithTimeout(locale.getString('common.global_setting_save_error_message'));
	        });
    	}else{
    		$anchorScroll();
    		alertService.showErrorMessageWithTimeout(locale.getString('spatial.invalid_data_saving'));
		    formService.setAllDirty(["configurationReportForm"], $scope);
		    $scope.submitedWithErrors = true;
    	}
    };
});