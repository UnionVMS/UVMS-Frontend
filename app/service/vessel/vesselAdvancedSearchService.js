(function() {
    var vesselAdvancedSearchService = function(validationService) {

        var advanceSearchJsonObj = {};

        var getAdvSearchObj = function(){
            return advanceSearchJsonObj;
        };

        var addFlagState = function(data){
            if(data && validationService.lettersOnly(data)){
                advanceSearchJsonObj.FLAG_STATE = data;
            } else{
                delete advanceSearchJsonObj.FLAG_STATE;
            }
        };

        var addName= function(data){
            if(data && validationService.lettersOnly(data)){
                advanceSearchJsonObj.NAME = data;
            } else {
                delete advanceSearchJsonObj.NAME;
            }
        };

        var cleanAdvancedSearchJsonObj = function(){
            advanceSearchJsonObj ={};// {
             /*   "FLAG_STATE":"",
                "EXTERNAL_MARKING":"",
                "NAME":"",
                "IRCS":"",
                "CFR":"",
                "MMSI":"",
                "HOMEPORT":"",
                "TYPE":"",
                "ACTIVE":"",
                "LICENSE":""*/
            //};
        };

        var addCFR = function(data){
            if(data && validationService.lettersAndDigits(data)) {
                advanceSearchJsonObj.CFR = data;
            } else {
                delete advanceSearchJsonObj.CFR;
            }
        };

        var addIRCS = function(data){
            if(data && validationService.lettersAndDigits(data)){
                advanceSearchJsonObj.IRCS = data;
            } else{
                delete advanceSearchJsonObj.IRCS;
            }

        };

        var addType = function(data){
            if(data && validationService.lettersOnly(data)){
                advanceSearchJsonObj.TYPE = data;
            } else{
                delete advanceSearchJsonObj.TYPE;
            }
        };

        var  addActive = function(data){
            if(data && validationService.lettersOnly(data)){
                advanceSearchJsonObj.ACTIVE = data;
            } else {
                delete advanceSearchJsonObj.ACTIVE;
            }
        };

        var  addLicenseType = function(data) {
            if(data && validationService.lettersOnly(data)){
                advanceSearchJsonObj.LICENSE = data;
            } else{
                delete advanceSearchJsonObj.LICENSE;
            }
        };

        var  addExternalMarking = function(data){
            if(data){
                advanceSearchJsonObj.EXTERNAL_MARKING = data;
            } else {
                delete advanceSearchJsonObj.EXTERNAL_MARKING;
            }
        };

        var  addHomePort = function(data){
            //TODO: Add validation?
            if (data){
                advanceSearchJsonObj.HOMEPORT = data;
            } else{
                delete advanceSearchJsonObj.HOMEPORT;
            }
        };

        var  addMMSI = function(data){
            //TODO: Add validation?
            if(data && validationService.lettersAndDigits(data)){
                advanceSearchJsonObj.MMSI = data;
            } else {
                delete advanceSearchJsonObj.MMSI;
            }
        };

        var performWildcardSearch = function(data){
            if (validationService.lettersAndDigits()){
                //do search...
                //take care of promise

            }
        };

        var performAdvancedSearch = function(){
            //do search...
            //take care of promise
        };

        return{
            getAdvSearchObj : getAdvSearchObj,
            cleanAdvancedSearchJsonObj : cleanAdvancedSearchJsonObj,
            performWildcardSearch: performWildcardSearch,
            performAdvancedSearch: performAdvancedSearch,
            addFlagState : addFlagState,
            addName: addName,
            addCFR: addCFR,
            addIRCS:addIRCS,
            addType:addType,
            addActive:addActive,
            addLicenseType:addLicenseType,
            addExternalMarking:addExternalMarking,
            addHomePort:addHomePort,
            addMMSI:addMMSI
        };
    };

    var module = angular.module('unionvmsWeb');
    module.factory('vesselAdvancedSearchService', vesselAdvancedSearchService);

}());


