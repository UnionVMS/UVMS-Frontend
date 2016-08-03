angular.module('unionvmsWeb').controller('MdrCtrl',function($scope, activityService, loadingStatus, locale){

    $scope.cronWidgetConfig = {
          allowMultiple: true
      };
   	$scope.mdrCodeLists = [];
    $scope.displayedMDRLists = [];
    $scope.isUpdateNowDisabled = true;

	$scope.init = function() {
	    activityService.getCronJobExpression().then(
	        function(response) {
        	    $scope.cronJobExpression = response;}, getCronJobExpressionFailed);

        $scope.getMDRCodeLists();


	};

    $scope.showSaveBtn = function(){
       return $scope.mdrConfigurationForm.$dirty && $scope.mdrConfigurationForm.cronJobExpression.$valid;
    };

	$scope.saveCron = function(){
		if(_.keys($scope.mdrConfigurationForm.$error).length === 0){
			loadingStatus.isLoading('Preferences',true, 2);

			if ($scope.mdrConfigurationForm.$dirty){
			//TODO get the cron job expression
			    var cronJobExpression = '';
		        activityService.updateCronJobExpression(cronJobExpression).then(saveSuccess, saveFailure);
		    } else {
		        $scope.alert.hasAlert = true;
		        $scope.alert.hasWarning = true;
		        $scope.alert.alertMessage = locale.getString('spatial.user_preferences_warning_saving');
		        $scope.alert.hideAlert();
		        loadingStatus.isLoading('Preferences',false);
		    }
		} else {
		    $scope.alert.hasAlert = true;
		    $scope.alert.hasError = true;
		    $scope.alert.alertMessage = locale.getString('spatial.invalid_data_saving');
		    $scope.alert.hideAlert();
		    $scope.submitedWithErrors = true;
		}
	};

    $scope.updateNow = function() {
    //TODO
         console.error("Not implemented. Refresh now." );
    };

     $scope.updateAllNow = function() {
        //TODO
             console.error("Not implemented. Refresh all now." );
        };

    $scope.enableDisableAutoUpdate = function(codeListID) {
    //TODO
        console.error("Not implemented. Enable/Disable codeList with ID " + codeListID);
    };

    $scope.selectDeselectAll = function() {
         if ($('#selectDeselectAll')[0].checked) {
            angular.forEach($scope.displayedMDRLists, function (value, key) {
                 value.isSelected = true;
            });

            $scope.isUpdateNowDisabled = false;
         } else {
              angular.forEach($scope.displayedMDRLists, function (value, key) {
                  value.isSelected = false;
             });

             $scope.isUpdateNowDisabled = true;
         }

    };

    $scope.enableDisableSynchButton = function() {
        if ( _.where($scope.displayedMDRLists, {'isSelected': true}).length > 0) {
            $scope.isUpdateNowDisabled = false;
        } else {
            $scope.isUpdateNowDisabled = true;
        }
    };

    //USER AREAS LIST
    $scope.getMDRCodeLists = function(){
        $scope.tableLoading = true;
        activityService.getMDRCodeLists().then(function(response){
            $scope.mdrCodeLists = response;
            $scope.displayedMDRLists = [].concat($scope.mdrCodeLists);
            $scope.tableLoading = false;
        }, function(error){
            $scope.tableLoading = false;
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('activity.error_getting_mdr_code_lists');
        });
    };

    var getCronJobExpressionSuccess = function(response) {
        $scope.alert.hasAlert = true;
        $scope.alert.hasSuccess = true;
        $scope.alert.alertMessage = locale.getString('spatial.user_preferences_success_saving');
        $scope.alert.hideAlert(6000);
        $scope.cronJobExpression = response;
        $scope.configPanelForm.$setPristine();
        loadingStatus.isLoading('Preferences',false);
    };

    var getCronJobExpressionFailed = function(error){
        $scope.alert.hasAlert = true;
        $scope.alert.hasError = true;
        $scope.alert.alertMessage = locale.getString('spatial.user_preferences_error_saving');
        $scope.alert.hideAlert();
        loadingStatus.isLoading('Preferences',false);
    };

	var saveSuccess = function(response){
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasSuccess = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_success_saving');
	    $scope.alert.hideAlert(6000);
	    $scope.updateConfigCopy(response[1]);
		$scope.configPanelForm.$setPristine();
	    loadingStatus.isLoading('Preferences',false);
	};

	var saveFailure = function(error){
	    $scope.alert.hasAlert = true;
	    $scope.alert.hasError = true;
	    $scope.alert.alertMessage = locale.getString('spatial.user_preferences_error_saving');
	    $scope.alert.hideAlert();
	    loadingStatus.isLoading('Preferences',false);
	};

	$scope.init();

    /*
    this watch is used on page change, when we need to reset the Synch Now button state and the global checkbox state
    */
    $scope.$watch(function(){return $scope.displayedMDRLists;}, function(newValue, oldValue) {
        if (newValue.length > 0) {
            var numSelectedItems = _.where(newValue, {'isSelected': true}).length;
            if (numSelectedItems === newValue.length) {
                $('#selectDeselectAll')[0].checked = true;
            } else {
                $('#selectDeselectAll')[0].checked = false;
            }

            if (numSelectedItems > 0) {
                $scope.isUpdateNowDisabled = false;
            } else {
                $scope.isUpdateNowDisabled = true;
            }

            angular.forEach(oldValue, function (value, key) {
                 value.isSelected = false;
            });
        }
    });
});
