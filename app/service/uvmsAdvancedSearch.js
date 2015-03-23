(function() {
    var uvmsAdvancedSearch = function(uvmsValidation) {

        var advanceSearchJsonObj = {};
            /*"IRCS":"",
            "CFR":"",
            "MMSI":"",
            "HOMEPORT":"",
            "TYPE":"",
            "ACTIVE":"",
            "LICENSE":""*/


        var getAdvSearchObj = function(){
            return advanceSearchJsonObj;
        };

        var addFlagState = function(data){
            if(uvmsValidation.lettersOnly(data))
            {
                advanceSearchJsonObj.FLAG_STATE = data;
            }
        };

        var addName= function(data){
            if(uvmsValidation.lettersOnly(data))
            {
                advanceSearchJsonObj.NAME = data;
            }
        };

        var cleanAdvancedSearchJsonObj = function(){
            advanceSearchJsonObj = {
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
            };
        };

        var addCFR = function(data){
            if(uvmsValidation.digitsOnly(data))
            {
                advanceSearchJsonObj.CFR = data;
            }
        };

        var addIRCS = function(data){

            if(uvmsValidation.lettersAndDigits(data))
            {
                advanceSearchJsonObj.IRCS = data;
            }
            if(data === "")
            {
                advanceSearchJsonObj.IRCS = "";
            }
        };

        var addType = function(data){
            if(uvmsValidation.lettersOnly(data))
            {
                advanceSearchJsonObj.TYPE = data;
            }
        };

        var  addActive = function(data){
            if(uvmsValidation.lettersOnly(data))
            {
                advanceSearchJsonObj.ACTIVE = data;
            }
        };
        var  addLicenseType = function(data){
            if(uvmsValidation.lettersOnly(data))
            {
                advanceSearchJsonObj.LICENSE = data;
            }
        };

        var performWildcardSearch = function(data){
            if (uvmsValidation.lettersAndDigits()){
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
            addLicenseType:addLicenseType
        };
    };

    var module = angular.module('unionvmsWeb');
    module.factory('uvmsAdvancedSearch',uvmsAdvancedSearch);

}());


