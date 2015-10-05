angular.module('unionvmsWeb')
.factory('SavedSearchGroup', function(SearchField, searchUtilsService) {

    function SavedSearchGroup(name, user, dynamic, searchFields){

        this.id = undefined;
        this.name = name;
        this.user = user;
        this.dynamic = dynamic;
        this.searchFields = searchFields;
    }

    SavedSearchGroup.fromVesselDTO = function(dto){
        var searchFields = [];
        if($.isArray(dto.searchFields)){
            for (var i = 0; i < dto.searchFields.length; i ++) {
                searchFields.push(SearchField.fromJson(dto.searchFields[i]));
            }
        }
        searchUtilsService.replaceMinMaxValuesWithSpans(searchFields);
        var savedSearchGroup = new SavedSearchGroup(dto.name, dto.user, dto.dynamic, searchFields);
        savedSearchGroup.id = dto.guid;
        return savedSearchGroup;
    };

    SavedSearchGroup.prototype.toVesselDTO = function(){
        //Create a copy of the searchFields list
        var copyOfSearchFields = [];
        $.each(this.searchFields, function(index, searchField){
            copyOfSearchFields.push(searchField.copy());
        });
        var customSearchFields = searchUtilsService.replaceSpansWithMinMaxValues(copyOfSearchFields);

        return {
            guid : this.id,
            name : this.name,
            user : this.user,
            dynamic : this.dynamic,
            searchFields : customSearchFields,
        };
    };

    SavedSearchGroup.prototype.toMovementDTO = function(){
        //List of properties that should have type ASSET
        var assetKeys = [
            "NAME",
            "FLAG_STATE",
            "IRCS",
            "TYPE",
            "LENGTH",
            "CFR",
            "STATUS"
        ];

        //List of properties that should have type OTHER
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

        return {
            id : this.id,
            name : this.name,
            user : this.user,
            dynamic : this.dynamic,
            searchFields : processedSearchFields
        };
    };

    SavedSearchGroup.fromMovementDTO = function(dto){
        var searchFields = [];
        if($.isArray(dto.searchFields)){
            for (var i = 0; i < dto.searchFields.length; i ++) {
                searchFields.push(SearchField.fromJson(dto.searchFields[i]));
            }
        }
        var savedSearchGroup = new SavedSearchGroup(dto.name, dto.user, dto.dynamic, searchFields);
        savedSearchGroup.id = dto.id;
        return savedSearchGroup;
    };

    return SavedSearchGroup;
});