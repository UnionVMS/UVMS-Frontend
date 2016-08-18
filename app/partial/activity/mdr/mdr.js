angular.module('unionvmsWeb').controller('MdrCtrl',function($scope, mdrRestService, loadingStatus, locale, alertService, $modal){

    $scope.cronWidgetConfig = {
          allowMultiple: true
      };
   	$scope.mdrCodeLists = [];
    $scope.displayedMDRLists = [];
    $scope.isUpdateNowDisabled = true;
    $scope.configModel = {
        'cronJobExpression': '',
        'showSaveBtn' : false,
        'originalValue': ''
    };
    $scope.tableLoading = true;



	$scope.init = function() {
	    mdrRestService.getCronJobExpression().then(getCronJobExpressionSuccess, getCronJobExpressionFailed);
        $scope.getMDRCodeLists();
	};

	$scope.saveCron = function(){
		if(angular.isDefined($scope.configModel.cronJobExpression) && $scope.configModel.cronJobExpression.indexOf('NaN') === -1){
			loadingStatus.isLoading('Preferences',true, 2);

			if ($scope.mdrConfigurationForm.$dirty){
		        mdrRestService.updateCronJobExpression($scope.configModel.cronJobExpression).then(saveSuccess, saveFailure);
		    }
		} else {

		}
	};

    $scope.updateNow = function() {
        var acronymArray = [];
        angular.forEach($scope.displayedMDRLists, function (value, key) {
             if (value.isSelected) {
                acronymArray.push(value.acronym);
             }
        });

        mdrRestService.syncNow(acronymArray).then(function(response) {
             $scope.getMDRCodeLists();
        }, function(error) {
            alertService.showErrorMessageWithTimeout(locale.getString('activity.error_sync_now'));
        });
    };

     $scope.updateAllNow = function() {
        mdrRestService.syncAllNow().then(function(response) {
             $scope.getMDRCodeLists();
        }, function(error) {
            alertService.showErrorMessageWithTimeout(locale.getString('activity.error_sync_all_now'));
        });
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
        mdrRestService.getMDRCodeLists().then(function(response){
            $scope.mdrCodeLists = response;
            $scope.displayedMDRLists = [].concat($scope.mdrCodeLists);
            $scope.tableLoading = false;
        }, function(error){
            $scope.tableLoading = false;
            alertService.showErrorMessageWithTimeout(locale.getString('activity.error_getting_mdr_code_lists'));
        });
    };

    var getCronJobExpressionSuccess = function(response) {
        //$scope.alert.hasAlert = true;
       // $scope.alert.hasSuccess = true;
        $scope.configModel.cronJobExpression = response;
        $scope.configModel.originalValue = response;
        loadingStatus.isLoading('Preferences',false);
    };

    var getCronJobExpressionFailed = function(error){
        loadingStatus.isLoading('Preferences',false);
        alertService.showErrorMessageWithTimeout(locale.getString('activity.mdr_cron_load_failed'));
    };

	var saveSuccess = function(response){
	    loadingStatus.isLoading('Preferences',false);
	    alertService.showSuccessMessageWithTimeout(locale.getString('activity.mdr_cron_save_success'));
	    $scope.configModel.originalValue = $scope.configModel.cronJobExpression;
	};

	var saveFailure = function(error){
	    loadingStatus.isLoading('Preferences',false);
	    alertService.showErrorMessageWithTimeout(locale.getString('activity.mdr_cron_save_failed'));
	};

	$scope.openCodeListModal = function(acronym) {
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

     $scope.$watch("configModel.cronJobExpression", function(newValue, oldValue) {
        if (angular.isDefined(oldValue) && oldValue && (newValue !==  $scope.configModel.originalValue)) {
            $scope.configModel.showSaveBtn = true;
        } else {
            $scope.configModel.showSaveBtn = false;
        }
      });
});
