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
 * @ngdoc controller
 * @name ActivityfiltersfieldsetCtrl
 * @param $scope {Service} controller scope
 * @param mdrCacheService {Service} The mdr code lists cache service <p>{@link unionvmsWeb.mdrCacheService}</p>
 * @param locale {service} angular locale service
 * @description
 *  The controller for the activity filters fieldset
 */
angular.module('unionvmsWeb').controller('ActivityfiltersfieldsetCtrl', function ($scope, locale, mdrCacheService) {

    $scope.codeLists = {
        comChannels: null,
        purposeCodes: null,
        reportTypes: null,
        gearTypes: null,
        activityTypes: null,
        weightUnits: [{ code: 'kg', text: 'Kg' }, { code: 'TNE', text: 'Ton' }]
    };

    $scope.visibleCombos = {
        reportType: true,
        activityType: true,
        gearType: true
    };

    //TODO replace the mocks when the REST service is ready
    $scope.weightUnits = [{
        code: 'kg', text: 'Kg'
    }, {
        code: 'ton', text: 'Ton'
    }];

    //TODO replace the mocks when the REST service is ready
    /*$scope.species = [{
        code: 'SOL', text: 'SOL'
    },{
        code: 'COD', text: 'COD'
    },{
        code: 'LEM', text: 'LEM'
    },{
        code: 'TUR', text: 'TUR'
    }];*/

    //TODO replace the mocks when the REST service is ready
    /*$scope.ports = [{
        code: 'PORT1', text: 'PORT1'
    },{
        code: 'PORT2', text: 'PORT2'
    },{
        code: 'PORT3', text: 'PORT3'
    },{
        code: 'PORT4', text: 'PORT4'
    }];*/

    /**
     * Get the data for all comboboxes used in the the advanced search form
     * 
     * @memberof ActivityfiltersfieldsetCtrl
     * @private
     */
    function getComboboxData() {
        var lists = ['reportTypes', 'gearTypes', 'activityTypes'];
        angular.forEach(lists, function (list) {
            var fnName = 'get' + list.substring(0, 1).toUpperCase() + list.substring(1);
            $scope[fnName]();
        });
    }

    /**
     * Get all activity types from MDR
     * 
     * @memberof ActivityfiltersfieldsetCtrl
     * @public
     * @alias getActivityTypes
     * @returns {Array} An array with all activity types
     */
    $scope.getActivityTypes = function () {
        $scope.codeLists.activityTypes = [];
        mdrCacheService.getCodeList('FLUX_FA_TYPE').then(function (response) {
            var suportedCodes = ['DEPARTURE', 'ARRIVAL', 'AREA_ENTRY', 'AREA_EXIT', 'FISHING_OPERATION', 'LANDING', 'DISCARD', 'TRANSHIPMENT', 'RELOCATION', 'JOINED_FISHING_OPERATION'];
            $scope.codeLists.activityTypes = convertCodelistToCombolist(response, true, true, suportedCodes);
        }, function (error) {
            $scope.actServ.setAlert(true, 'activity.activity_error_getting_code_lists');
            $scope.visibleCombos.activityType = false;
        });
    };

    /**
       * Get all report types from MDR
       * 
       * @memberof ActivityfiltersfieldsetCtrl
       * @public
       * @alias getReportTypes
       * @returns {Array} An array with all report types
       */
    $scope.getReportTypes = function () {
        $scope.codeLists.reportTypes = [];
        mdrCacheService.getCodeList('FLUX_FA_REPORT_TYPE').then(function (response) {
            $scope.codeLists.reportTypes = convertCodelistToCombolist(response, false, false);
        }, function (error) {
            $scope.actServ.setAlert(true, 'activity.activity_error_getting_code_lists');
            $scope.visibleCombos.reportType = false;
        });
    };


    /**
     * Get all gear types from MDR
     * 
     * @memberof ActivityfiltersfieldsetCtrl
     * @public
     * @alias getGearTypes
     * @returns {Array} An array with all gear types
     */
    $scope.getGearTypes = function () {
        $scope.codeLists.gearTypes = [];
        mdrCacheService.getCodeList('GEAR_TYPE').then(function (response) {
            $scope.codeLists.gearTypes = convertCodelistToCombolist(response, true, false);
        }, function (error) {
            $scope.actServ.setAlert(true, 'activity.activity_error_getting_code_lists');
            $scope.visibleCombos.gearType = false;
        });
    };

    /**
     * Convert code lists array into combobox list array
     * 
     * @memberof ActivityfiltersfieldsetCtrl
     * @private
     * @param {Array} data - The input data array
     * @param {Boolean} withTooltip - True if the item text and tooltip description should be different
     * @parm {Boolean} useAbbreviations - Whether the item text should be fetched from the abbreviations lang file or not
     * @param {Array} [suportedCodes] - An array containing the supported codes. This param is optional
     * @returns {Array} An array suitable for combobox use
     */
    function convertCodelistToCombolist(data, withTooltip, useAbbreviations, suportedCodes) {
        var comboList = [];
        angular.forEach(data, function (item) {
            if (item.code === 'JOINED_FISHING_OPERATION') {
                item.code = 'JOINT_FISHING_OPERATION';
            }
            var rec = {
                code: item.code,
                text: item.description
            };
            if (withTooltip) {
                if (useAbbreviations) {
                    rec.text = locale.getString('abbreviations.activity_' + item.code);
                } else {
                    rec.text = item.code;
                }

                rec.desc = item.description;
            }

            if (angular.isDefined(suportedCodes)) {
                if (_.indexOf(suportedCodes, item.code) !== -1 || (item.code === 'JOINT_FISHING_OPERATION' && _.indexOf(suportedCodes, 'JOINED_FISHING_OPERATION') !== -1)) {
                    comboList.push(rec);
                }
            } else {
                comboList.push(rec);
            }
        });

        return comboList;
    }

    /**
     * Initialization function
     * 
     * @memberof ActivityCtrl
     * @private
     */
    function init() {
        getComboboxData();
    }

    init();
});