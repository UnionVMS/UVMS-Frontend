angular.module('unionvmsWeb')
.factory('SavedSearchGroup', function(SearchField) {

    function SavedSearchGroup(name, user, dynamic, searchFields){

        this.id = undefined;
        this.name = name;
        this.user = user;
        this.dynamic = dynamic;
        this.searchFields = searchFields;
    }

    SavedSearchGroup.fromJson = function(data){
        var searchFields = [];
        if($.isArray(data.searchFields)){
            for (var i = 0; i < data.searchFields.length; i ++) {
                searchFields.push(SearchField.fromJson(data.searchFields[i]));
            }
        }
        var savedSearchGroup = new SavedSearchGroup(data.name, data.user, data.dynamic, searchFields);
        savedSearchGroup.id = data.id;
        return savedSearchGroup;
    };

    SavedSearchGroup.prototype.toJson = function(){
        return JSON.stringify({
            id : this.id,
            name : this.name,
            user : this.user,
            dynamic : this.dynamic,
            searchFields : this.searchFields,
        });
    };

    SavedSearchGroup.prototype.toMovementJson = function(){
        var assetKeys = [
            //There are others types in vessel but we dont use them here.
            /*"GUID",
            "MMSI",
            "EXTERNAL_MARKING",
            "HOMEPORT",
            "ACTIVE",
            "LICENSE",
            "TYPE"*/

            "NAME",
            "FLAG_STATE",
            "IRCS",
            "TYPE",
            "LENGTH",
            "CFR",
            "STATUS"
        ];

        var otherKeys = [
            "TIME_SPAN",
            "LENGTH_SPAN",
            "MEAS_SPEED_SPAN"
        ];

        var processedSearchFields = [];

        $.each(this.searchFields,function(index, sf){
            var sF = {};
            sF.key = sf.key;
            sF.value = sf.value;

            if(_.contains(assetKeys, sf.key)){
                sF.type = "ASSET";
            } else if(_.contains(otherKeys, sf.key)){
                sF.type = "OTHER";
            }else {
                sF.type = "MOVEMENT";
            }
            processedSearchFields.push(sF);
        });

        return JSON.stringify({
            id : this.id,
            name : this.name,
            user : this.user,
            dynamic : this.dynamic,
            searchFields : processedSearchFields
        });
    };

    SavedSearchGroup.fromMovementJson = function(data){
        var searchFields = [];
        if($.isArray(data.searchFields)){
            for (var i = 0; i < data.searchFields.length; i ++) {
                searchFields.push(SearchField.fromJson(data.searchFields[i]));
            }
        }
        var savedSearchGroup = new SavedSearchGroup(data.name, data.user, data.dynamic, searchFields);
        savedSearchGroup.id = data.id;
        return savedSearchGroup;
    };

    return SavedSearchGroup;
});