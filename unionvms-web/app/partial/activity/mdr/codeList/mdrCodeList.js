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
 * @name MdrcodelistCtrl
 * @param $scope {Service} controller scope
 * @param $modalInstance {Service} angular service modalInstance
 * @param acronym {Service} the MDR code
 * @param mdrRestService {Service} the mdr REST service <p>{@link unionvmsWeb.mdrRestService}</p>
 * @param $timeout {Service} angular service timeout
 * @description
 *  The controller for the mdr code list
 */
angular.module('unionvmsWeb').controller('MdrcodelistCtrl',function($scope, $modalInstance, acronym, mdrRestService, $timeout){

    $scope.itemsByPage = 25;
    $scope.displayedMdrCodeList = [];
    $scope.columns = ['code', 'description'];
    $scope.searchAttrs = ['code', 'description', 'version'];
    $scope.acronym = acronym;
    var currentTableState;
    var lastTableState;

    $scope.specialAcronymColumns = {
        'CONVERSION_FACTOR': {
            cols: ['state', 'presentation', 'factor', 'placesCode', 'legalSource', 'collective'],
            mappings: {
                'state': 'state',
                'presentation': 'presentation',
                'factor': 'factor',
                'placesCode': 'places_code',
                'legalSource': 'legal_source',
                'collective': 'collective'
            }
        },
        'EFFORT_ZONE': {
            cols: ['legalReference'],
            mappings: {
                'legalReference': 'legal_reference'
            }
        },
        'FA_BR': {
            cols: ['fluxGpValidationTypeCode', 'activationIndicator'],
            mappings: {
                'activationIndicator': 'activation_indicator',
                'fluxGpValidationTypeCode': 'flux_gp_validation_type_code'
            }
        },
        'FA_BR_DEF': {
            cols: ['field', 'messageIfFailing'],
            mappings: {
                'field': 'field',
                'messageIfFailing': 'message_if_failing'
            }
        },
        'FA_CHARACTERISTIC': {
            cols: ['dataTypeDesc'],
            mappings: {
                'dataTypeDesc': 'data_type_desc'
            }
        },
        'FA_GEAR_CHARACTERISTIC': {
            cols: ['dataTypeDesc'],
            mappings: {
                'dataTypeDesc': 'data_type_desc'
            }
        },
        'FAO_AREA': {
            cols: ['enLevelName'],
            mappings: {
                'enLevelName': 'en_level_name'
            }
        },
        'FAO_SPECIES': {
            cols: ['family', 'bioOrder', 'scientificName', 'enName', 'taxoCode'],
            mappings: {
                'family': 'family',
                'bioOrder': 'bio_order',
                'scientificName': 'scientific_name',
                'enName': 'en_name',
                'taxoCode': 'taxo_code'
            }
        },
        'FARM': {
            cols: ['rfmoCode', 'contractingParty', 'placesCode'],
            mappings: {
                'rfmoCode': 'rfmo_code',
                'contractingParty': 'contracting_party',
                'placesCode': 'places_code'
            }
        },
        'FISH_PRESENTATION': {
            cols: ['enName'],
            mappings: {
                'enName': 'en_name'
            }
        },
        'LOCATION': {
            cols: ['latitude', 'longitude', 'enName', 'placesCode','unloCode', 'unFunctionCode'],
            mappings: {
                'enName': 'en_name',
                'placesCode': 'places_code',
                'unloCode': 'unlo_code',
                'unFunctionCode': 'un_function_code'
            }
        },
        'TERRITORY': {
            cols: ['enName', 'landTypeCode'],
            mappings: {
                'enName': 'en_name',
                'landTypeCode': 'land_type_code'
            }
        },
        'STAT_RECTANGLE': {
            cols: ['source'],
            mappings: {
                'source': 'source'
            }
        }
    };

    setColumns(acronym);
    setSearchAttrs(acronym);

    /**
     * Sets the columns for acronym table
     *
     * @param {String} acronym - The acronym name
     */
    function setColumns (acronym){
        if (_.has($scope.specialAcronymColumns, acronym)){
            $scope.columns = $scope.columns.concat($scope.specialAcronymColumns[acronym].cols);
        }

        $scope.columns = $scope.columns.concat(['startDate', 'endDate', 'version']);
    }

    /**
     * Sets the searching attributes to be sent in the search request headers
     *
     * @param {String} acronym - The acronym name
     */
    function setSearchAttrs(acronym) {
        if (_.has($scope.specialAcronymColumns, acronym)){
            var additionalAttrs = _.values($scope.specialAcronymColumns[acronym].mappings);
            if (additionalAttrs.length > 0){
                $scope.searchAttrs = $scope.searchAttrs.concat(additionalAttrs);
            }
        }
    }

    /**
     * Closes the mdr code list modal
     *
     * @memberof MdrcodelistCtrl
     * @function close
     * @public
     */
    $scope.close = function() {
        $modalInstance.close();
    };

    /**
     * Load validity dates in MDR lists
     *
     * @memberof MdrcodelistCtrl
     * @function loadValidityDates
     * @public
     * @param {Array} list - mdr code list
     * @param String acronym - mdr acronym
     */
    var loadValidityDates = function(list, acronym) {
        angular.forEach(list, function(item){
            if (angular.isDefined(item.endDate) && acronym === 'FA_BR') {
               item.endDate = endDateReformat(item.endDate);
            }
            if(item.validity){
                item.startDate = item.validity.startDate;
                item.endDate = item.validity.endDate;
            }
            delete item.validity;
        });
    };

    var endDateReformat = function(data) {
        var tempEndDate = new Date(data);
        var momTime = moment.utc(tempEndDate);
        momTime.set({h: 23, m: 59, s: 59});
        return momTime.toDate().getTime();
    }

    /**
     * Sets the proper field names for server sorting and filtering of the acronym table
     *
     * @param {String} acronym - the acronym name
     * @param {String} predicate - the predicate name being used in the smart table
     * @returns {String} the field name to be used in the sorting and filtering request header
     */
    var setProperColNamesForSorting = function(acronym, predicate){
        if (_.has($scope.specialAcronymColumns, acronym) && _.has($scope.specialAcronymColumns[acronym].mappings, predicate)){
            return $scope.specialAcronymColumns[acronym].mappings[predicate];
        } else {
          return predicate;
        }
    };

    /**
     * Closes the mdr code list modal
     *
     * @memberof MdrcodelistCtrl
     * @function callServer
     * @public
     * @param {Object} tableState - current state of filters and sorting of table
     */
    $scope.callServer = function(tableState) {
        var sortAttr;
        if(angular.isDefined(tableState.sort) && ['startDate', 'endDate'].indexOf(tableState.sort.predicate) !== -1 ){
            sortAttr = 'validity.' + tableState.sort.predicate;
        }

        if (angular.isUndefined(sortAttr) && angular.isDefined(tableState.sort)){
            sortAttr = setProperColNamesForSorting(acronym, tableState.sort.predicate);
        }

        mdrRestService.getMDRCodeList(acronym, tableState, $scope.searchAttrs, sortAttr).then(function (result) {
            if (angular.isDefined(result)) {
                if(!angular.equals($scope.displayedMdrCodeList, result)){
                    loadValidityDates(result, acronym);
                    $scope.displayedMdrCodeList = result;
                }
            }else{
                $scope.displayedMdrCodeList = [];
            }
            $scope.tableLoading = false;
        });
    };

    $scope.filterChanged = function(tableState){
        currentTableState = tableState;

        if(!angular.isDefined(currentTableState.pagination.number)){
            currentTableState.pagination.number = $scope.itemsByPage;
        }

        var state = angular.copy(tableState);
        delete state.pagination.numberOfPages;

        if(!_.isEqual(lastTableState,state)){
            $scope.tableLoading = true;
            if ($scope.requestTimer){
                $timeout.cancel($scope.requestTimer);
            }

            $scope.requestTimer = $timeout(function(){
                $scope.callServer(currentTableState);
                lastTableState = angular.copy(state);
            }, 1500, true, $scope);
        }else{
            $scope.tableLoading = false;
        }
    };

});

