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
        savedSearchGroup.id = dto.id;
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
            "IRCS",
            "FLAG_STATE",
            "CFR",
            "EXTERNAL_MARKING",
            "NAME",
            "ASSET_TYPE",
            "CFR_IRCS_NAME",
            "HOMEPORT",
            "GEAR_TYPE",
            "IMO"
        ];

        //List of properties that should have type OTHER
        var otherKeys = [
            "ASSET_GROUP_ID",
            "TIME_SPAN",
            "LENGTH_SPAN",
            "SPEED_SPAN",
            "FROM_DATE",
            "TO_DATE"
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

    SavedSearchGroup.prototype.getSearchFieldsCopy = function(){
        var copy = [];
        $.each(this.searchFields, function(index, searchField){
            copy.push(searchField.copy());
        });

        return copy;
    };

    SavedSearchGroup.prototype.copy = function() {
        var copy = new SavedSearchGroup(this.name, this.user, this.dynamic, this.getSearchFieldsCopy());
        copy.id = this.id;
        return copy;
    };

    return SavedSearchGroup;
});