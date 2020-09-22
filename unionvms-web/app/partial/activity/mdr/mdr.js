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
 /** This controler is managing all actions triggered within the MDR configuration tab.
   *
   * @memberof unionvmsWeb
   * @ngdoc controller
   * @name MdrCtrl
   * @param $scope {service} controller scope
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
        'originalValue': ''
    };

    /**
     * @property {Boolean} tableLoading is a flag defining whether we need to show the loading icon.
     */
    $scope.tableLoading = true;

    /**
     * @property {Boolean} selectedAll is a flag defining whether all mdr code lists have been selected or not
     */
    $scope.selectedAll = false;

    /**
     * @property {Number} numValidityColumns number of validity columns
     */
    $scope.numValidityColumns = 0;

    /**
     * @property {Object} holding the information of the webservice configuration, used to synchronise mdr
     */
    $scope.webserviceConfig = {
        'wsdlLocation' : '',
        'webserviceName' : '',
        'webserviceNamespace' : ''
    };


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
            mdrRestService.getWebserviceConfiguration().then(getWebserviceConfigurationSuccess, getWebserviceConfigurationFailed);
        }

	    if ($scope.isAllowed('LIST_MDR_CODE_LISTS')) {
	        $scope.getAcronymsDetails();
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
		if(angular.isDefined($scope.configModel.cronJobExpression) && $scope.configModel.cronJobExpression.indexOf('NaN') === -1 && $scope.mdrConfigurationForm.$dirty){
            loadingStatus.isLoading('MdrSettings',true, 2);
            mdrRestService.updateCronJobExpression($scope.configModel.cronJobExpression).then(saveSuccess, saveFailure);
		}
	};

	$scope.saveWebserviceConfig = function() {
	    if(angular.isDefined($scope.webserviceConfig.wsdlLocation) && angular.isDefined($scope.webserviceConfig.webserviceName) && angular.isDefined($scope.webserviceConfig.webserviceNamespace)) {
            loadingStatus.isLoading('MdrSettings',true, 2);
            mdrRestService.updateWebserviceConfiguration($scope.webserviceConfig).then(saveWebserviceConfigSuccess, saveWebserviceConfigFailure);
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
        loadingStatus.isLoading('MdrSettings',true);
        var acronymArray = [];
        angular.forEach($scope.displayedMDRLists, function (value, key) {
             if (value.isSelected) {
                acronymArray.push(value.objectAcronym);
             }
        });

        mdrRestService.syncNow(acronymArray).then(function(response) {
            if(angular.isDefined(response.includedObject)){
                loadingStatus.isLoading('MdrSettings',true);
                $scope.tableLoading = true;
                getAcronymsDetailsSuccess(response.includedObject);
            }
            //$scope.getAcronymsDetails();
            loadingStatus.isLoading('MdrSettings',false);
        }, function(error) {
            alertService.showErrorMessageWithTimeout(locale.getString('activity.error_sync_now'));
            loadingStatus.isLoading('MdrSettings',false);
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
        loadingStatus.isLoading('MdrSettings',true);
        mdrRestService.syncAllNow().then(function(response) {
            if(response.includedObject){
                loadingStatus.isLoading('MdrSettings',true);
                $scope.tableLoading = true;
                getAcronymsDetailsSuccess(response.includedObject);
            }
            //$scope.getAcronymsDetails();
            loadingStatus.isLoading('MdrSettings',false);
        }, function(error) {
            alertService.showErrorMessageWithTimeout(locale.getString('activity.error_sync_all_now'));
            loadingStatus.isLoading('MdrSettings',false);
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
         if ($scope.selectedAll) {
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
        if (_.where($scope.displayedMDRLists, {'isSelected': true}).length > 0) {
            $scope.isUpdateNowDisabled = false;
        } else {
            $scope.isUpdateNowDisabled = true;
        }
        checkSelectedAll();
    };


    /**
     * method that fetches all the MDR Code lists
     *
     * @memberof MdrCtrl
     * @function getAcronymsDetails
     * @public
     */
    $scope.getAcronymsDetails = function(){
        loadingStatus.isLoading('MdrSettings',true);
        $scope.tableLoading = true;
        mdrRestService.getAcronymsDetails().then(getAcronymsDetailsSuccess, getAcronymsDetailsError);
    };

    var getAcronymsDetailsSuccess = function(response) {
        loadValidityDates(response);
        $scope.mdrCodeLists = response;
        $scope.displayedMDRLists = [].concat($scope.mdrCodeLists);
        checkSelectedAll();
        loadingStatus.isLoading('MdrSettings',false);
        $scope.tableLoading = false;
    };

    var getAcronymsDetailsError = function(error) {
        alertService.showErrorMessageWithTimeout(locale.getString('activity.error_getting_mdr_code_lists'));
        loadingStatus.isLoading('MdrSettings',false);
        $scope.tableLoading = false;
    };

    var getCronJobExpressionSuccess = function(response) {
        $scope.configModel.cronJobExpression = response;
        $scope.configModel.originalValue = response;
        loadingStatus.isLoading('MdrSettings',false);
    };

    var getCronJobExpressionFailed = function(error){
        loadingStatus.isLoading('MdrSettings',false);
        alertService.showErrorMessageWithTimeout(locale.getString('activity.mdr_cron_load_failed'));
    };

    var getWebserviceConfigurationSuccess = function(response) {
        $scope.webserviceConfig.wsdlLocation = response.wsdlLocation;
        $scope.webserviceConfig.webserviceName = response.webserviceName;
        $scope.webserviceConfig.webserviceNamespace = response .webserviceNamespace;
    };

    var getWebserviceConfigurationFailed = function(error) {
        alertService.showErrorMessageWithTimeout(locale.getString('activity.mdr_webservice_config_load_failed'));
    };

	var saveSuccess = function(response){
	    loadingStatus.isLoading('MdrSettings',false);
	    alertService.showSuccessMessageWithTimeout(locale.getString('activity.mdr_cron_save_success'));
	    $scope.configModel.originalValue = $scope.configModel.cronJobExpression;
	};

	var saveFailure = function(error){
	    loadingStatus.isLoading('MdrSettings',false);
	    alertService.showErrorMessageWithTimeout(locale.getString('activity.mdr_cron_save_failed'));
	};

	var saveWebserviceConfigSuccess = function(response){
	    loadingStatus.isLoading('MdrSettings',false);
	    alertService.showSuccessMessageWithTimeout(locale.getString('activity.mdr_webservice_config_save_success'));
	};

	var saveWebserviceConfigFailure = function(error){
	    loadingStatus.isLoading('MdrSettings',false);
	    alertService.showErrorMessageWithTimeout(locale.getString('activity.mdr_webservice_config_save_failed'));
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
       return userService.isAllowed(feature, 'MDR Cache', true);
    };

    /**
     * this method checks if the global checkbox in the table is checked
     * @memberof MdrCtrl
     * @function checkSelectedAll
     * @private
     */
    var checkSelectedAll = function(){
        if(_.where($scope.displayedMDRLists, {'isSelected': true}).length === $scope.displayedMDRLists.length){
            $scope.selectedAll = true;
        }else{
            $scope.selectedAll = false;
        }
    };

    /**
     * Load validity dates in MDR lists
     *
     * @memberof MdrCtrl
     * @function loadValidityDates
     * @public
     * @param {Array} list - mdr code list
     */
    var loadValidityDates = function(list) {
        var validityDates = _.pluck(list, 'validity');
        validityDates = _.without(validityDates, null);
        var hasStartValidity;
        var hasEndValidity;

        if(validityDates.length){
            for(var i=0;i<validityDates.length;i++){
                if(validityDates[i].startDate){
                    $scope.hasStartValidity = true;
                }

                if(validityDates[i].endDate){
                    $scope.hasEndValidity = true;
                }

                if($scope.hasStartValidity && $scope.hasEndValidity){
                    break;
                }
            }

            $scope.numValidityColumns = 0;
            if($scope.hasStartValidity){
                $scope.numValidityColumns++;
            }

            if($scope.hasEndValidity){
                $scope.numValidityColumns++;
            }

            angular.forEach(list, function(item){
                if(item.validity){
                    item.startDate = item.validity.startDate;
                    item.endDate = item.validity.endDate;
                    delete item.validity;
                }
            });
        }
    };


	$scope.init();

    /*
    this watch is used on page change, when we need to reset the Synch Now button state and the global checkbox state
    */
    $scope.$watch(function(){return $scope.displayedMDRLists;}, function(newValue, oldValue) {
        if (newValue.length > 0) {
            var numSelectedItems = _.where(newValue, {'isSelected': true}).length;
            checkSelectedAll();

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

