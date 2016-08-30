 /** This controler is managing all actions triggered within the MDR configuration tab.
   *
   * @memberof unionvmsWeb
   * @ngdoc controller
   * @name MdrCtrl
   * @param  $scope  {service} controller scope
   * @param mdrRestService {service}
   * @param loadingStatus {service}
   * @param locale {service}
   * @param alertService {service}
   * @param $modal {service}
   */
angular.module('unionvmsWeb').controller('MdrCtrl',function($scope, mdrRestService, loadingStatus, locale, alertService, $modal, userService){

    /**
     * @property {Object} cronWidgetConfig is a configuration object, used by the angularjs-cron-plugin
     */
     $scope.cronWidgetConfig = {
          allowMultiple: true
      };

    /**
     * @property {Array} mdrCodeLists is an  array of code list details objects. It keeps the full list of code lists,
     * due to the client side pagination we use.
     */
   	$scope.mdrCodeLists = [];

   	/**
     * @property {Array} displayedMDRLists is an  array of code list details objects. It keeps only the elements displayed on the current page.
     */
    $scope.displayedMDRLists = [];

    /**
     * @property {Boolean} isUpdateNowDisabled is a boolean flag which is used to control the visibility of the 'Update Now' button.
     */
    $scope.isUpdateNowDisabled = true;

    /**
     * @property {Object} configModel is an object used to keep the cron job expression and boolean flags used in the buttons logic.
     */
    $scope.configModel = {
        'cronJobExpression': '',
        'showSaveBtn' : false,
        'originalValue': ''
    };

     /**
     * @property {Boolean} tableLoading is a flag defining whether we need to show the loading icon.
     */
    $scope.tableLoading = true;


    /**
     * initializes the cron job expression and the MDR code lists
     *
     * @memberof MdrCtrl
     * @function init
     * @public
     */
	$scope.init = function() {
	    if ($scope.isAllowed('CONFIGURE_MDR_SCHEDULER')) {
            mdrRestService.getCronJobExpression().then(getCronJobExpressionSuccess, getCronJobExpressionFailed);
        }

	    if ($scope.isAllowed('LIST_MDR_CODE_LISTS')) {
	        $scope.getMDRCodeLists();
        }
	};


    /**
     * method that saves the crontab expression
     *
     * @memberof MdrCtrl
     * @function saveCron
     * @public
     */
	$scope.saveCron = function(){
		if(angular.isDefined($scope.configModel.cronJobExpression) && $scope.configModel.cronJobExpression.indexOf('NaN') === -1){
			loadingStatus.isLoading('Preferences',true, 2);

			if ($scope.mdrConfigurationForm.$dirty){
		        mdrRestService.updateCronJobExpression($scope.configModel.cronJobExpression).then(saveSuccess, saveFailure);
		    }
		}
	};

    /**
     * method that sends a MDR update request with a list of selected acronyms and on success response, it updates the MDR code lists table.
     *
     * @memberof MdrCtrl
     * @function updateNow
     * @public
     */
    $scope.updateNow = function() {
        var acronymArray = [];
        angular.forEach($scope.displayedMDRLists, function (value, key) {
             if (value.isSelected) {
                acronymArray.push(value.objectAcronym);
             }
        });

        mdrRestService.syncNow(acronymArray).then(function(response) {
             $scope.getMDRCodeLists();
        }, function(error) {
            alertService.showErrorMessageWithTimeout(locale.getString('activity.error_sync_now'));
        });
    };


    /**
     * method that sends a MDR update request for all code lists, it updates the MDR code lists table.
     *
     * @memberof MdrCtrl
     * @function updateAllNow
     * @public
     */
     $scope.updateAllNow = function() {
        mdrRestService.syncAllNow().then(function(response) {
             $scope.getMDRCodeLists();
        }, function(error) {
            alertService.showErrorMessageWithTimeout(locale.getString('activity.error_sync_all_now'));
        });
    };


    /**
     * method that enables/disables the scheduled update of a given code list.
     *
     * @memberof MdrCtrl
     * @function enableDisableAutoUpdate
     * @public
     * @param {Number} the ID of the code list that needs to be disabled/enabled
     */
    $scope.enableDisableAutoUpdate = function(codeListID) {
        var selectedCodeList = $scope.displayedMDRLists[codeListID];

        mdrRestService.enableDisableScheduledUpdate(selectedCodeList.objectAcronym, !selectedCodeList.schedulable).then(function(response) {
            $scope.displayedMDRLists[codeListID].schedulable = !selectedCodeList.schedulable;
        }, function(error) {
            alertService.showErrorMessageWithTimeout(locale.getString('activity.error_enable_disable_scheduled_code_list') + selectedCodeList.objectAcronym);
        });
    };

    /**
     * method that ticks/unticks all checkboxes in the MDR code list table
     *
     * @memberof MdrCtrl
     * @function selectDeselectAll
     * @public
     */
    $scope.selectDeselectAll = function() {
         if ($('#selectDeselectAll')[0].checked) {
            angular.forEach($scope.displayedMDRLists, function (value, key) {
                 value.isSelected = true;
            });

            if ($scope.displayedMDRLists && $scope.displayedMDRLists.length > 0) {
                $scope.isUpdateNowDisabled = false;
            }
         } else {
              angular.forEach($scope.displayedMDRLists, function (value, key) {
                  value.isSelected = false;
             });

             $scope.isUpdateNowDisabled = true;
         }

    };


    /**
     * the method checks if we have no checkboxes selected and disables the 'Update Now' button
     *
     * @memberof MdrCtrl
     * @function enableDisableSynchButton
     * @public
     */
    $scope.enableDisableSynchButton = function() {
        if ( _.where($scope.displayedMDRLists, {'isSelected': true}).length > 0) {
            $scope.isUpdateNowDisabled = false;
        } else {
            $scope.isUpdateNowDisabled = true;
        }
    };


    /**
     * method that fetches all the MDR Code lists
     *
     * @memberof MdrCtrl
     * @function getMDRCodeLists
     * @public
     */
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


    /**
     * this method constructs a modal displaying a table with the content of certain MDR code list
     *
     * @memberof MdrCtrl
     * @function openCodeListModal
     * @public
     * @param {String} acronym - is the MDR code list acronym
     */
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

    /**
     * this method checks if the current user has a specified USM feature
     * @memberof MdrCtrl
     * @function isAllowed
     * @public
     * @param {String} feature - is the USM feature name to check
     * @return {Boolean} true if the user has the specified feature in his profile
     */
     $scope.isAllowed = function(feature){
       return userService.isAllowed(feature, 'Activity', true);
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
