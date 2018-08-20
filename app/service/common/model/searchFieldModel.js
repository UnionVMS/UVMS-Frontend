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
    
    SearchField.fromJsonAsset = function(data){
        return new SearchField(data.field, data.value);
    };

    SearchField.prototype.toJsonAsset = function(){
        return JSON.stringify({
            field : this.key,
            value : this.value,
        });
    };

    SearchField.prototype.copy = function(){
        return new SearchField(this.key, this.value);
    };

    return SearchField;
});