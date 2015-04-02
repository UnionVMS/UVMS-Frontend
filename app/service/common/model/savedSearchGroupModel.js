angular.module('unionvmsWeb') 
.factory('SavedSearchGroup', function(SearchField) {

    function SavedSearchGroup(name, user, dynamic, searchFields){
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

    return SavedSearchGroup;
});