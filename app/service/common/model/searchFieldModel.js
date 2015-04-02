angular.module('unionvmsWeb') 
.factory('SearchField', function() {

    function SearchField(key, value){
        this.key = key;
        this.value = value;
    }

    SearchField.fromJson = function(data){
        return new SearchField(data.key, data.value);
    };    

    SearchField.prototype.toJson = function(){
        return JSON.stringify({
            key : this.key,
            value : this.value,
        });
    };

    return SearchField;
});