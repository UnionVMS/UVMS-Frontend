angular.module('unionvmsWeb').controller('MdrCtrl',function($scope, mdrService, loadingStatus, locale, alertService, $modal){

    $scope.cronWidgetConfig = {
          allowMultiple: true
      };
   	$scope.mdrCodeLists = [];
    $scope.displayedMDRLists = [];
    $scope.isUpdateNowDisabled = true;
    $scope.showSaveBtn = false;
    $scope.cronJobExpression = null;
    $scope.tableLoading = true;



	$scope.init = function() {
	    mdrService.getCronJobExpression().then(getCronJobExpressionSuccess, getCronJobExpressionFailed);
        $scope.getMDRCodeLists();
	};

	$scope.saveCron = function(){
		if(angular.isDefined($scope.cronJobExpression) && $scope.cronJobExpression.indexOf('NaN') === -1){
			loadingStatus.isLoading('Preferences',true, 2);

			if ($scope.mdrConfigurationForm.$dirty){
		        mdrService.updateCronJobExpression($scope.cronJobExpression).then(saveSuccess, saveFailure);
		    } /*else {
		        $scope.alert.hasAlert = true;
		        $scope.alert.hasWarning = true;
		        $scope.alert.alertMessage = locale.getString('spatial.user_preferences_warning_saving');
		        $scope.alert.hideAlert();
		        loadingStatus.isLoading('Preferences',false);
		    }*/
		} else {

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
        mdrService.getMDRCodeLists().then(function(response){
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
        //$scope.alert.hasAlert = true;
       // $scope.alert.hasSuccess = true;
        $scope.cronJobExpression = response;
        loadingStatus.isLoading('Preferences',false);
    };

    var getCronJobExpressionFailed = function(error){
        loadingStatus.isLoading('Preferences',false);
        alertService.showErrorMessageWithTimeout(locale.getString('activity.mdr_cron_load_failed'));
    };

	var saveSuccess = function(response){
	    loadingStatus.isLoading('Preferences',false);
	    alertService.showInfoMessageWithTimeout(locale.getString('activity.mdr_cron_save_success'));
	};

	var saveFailure = function(error){
	    loadingStatus.isLoading('Preferences',false);
	    alertService.showInfoMessageWithTimeout(locale.getString('activity.mdr_cron_save_failed'));
	};

	$scope.openCodeListModal = function(acronym) {
	    //TODO
	    console.error("openCodeListModal not implemented. Parameter: " + acronym);

        var modalInstance = $modal.open({
            templateUrl: 'partial/activity/mdr/codeList/mdrCodeList.html',
            controller: 'MdrcodelistCtrl',
            size: 'lg',
            resolve: {
                acronym: function(){
                    return acronym;
                }
            }
        });
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

     $scope.$watch("cronJobExpression", function(newValue, oldValue) {
        if (angular.isDefined(oldValue) && oldValue !==null && (newValue !== oldValue)) {
            $scope.showSaveBtn = true;
        } else {
            $scope.showSaveBtn = false;
        }
      });
});
