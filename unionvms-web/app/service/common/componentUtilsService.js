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
angular.module('unionvmsWeb').factory('componentUtilsService',function() {

       
    var convertCodelistToCombolist = function(data, withTooltip, useAbbreviations, supportedCodes, extraField){
        var comboList = [];
        angular.forEach(data, function(item) {
            if (item.code === 'JOINED_FISHING_OPERATION'){
                item.code = 'JOINT_FISHING_OPERATION';
            }
            var rec = {
                 code: item.code,
                 text: item.description
            };     
            if (extraField) {
                 rec[extraField] = item[extraField];
            }
            if (withTooltip){
                 if (useAbbreviations){
                     rec.text = locale.getString('abbreviations.activity_' + item.code);
                 } else {
                     rec.text = item.code;
                 }     
                 rec.desc = item.description;
            }     
            if (angular.isDefined(supportedCodes)){
                 if (_.indexOf(supportedCodes, item.code) !== -1 || (item.code === 'JOINT_FISHING_OPERATION' && _.indexOf(supportedCodes, 'JOINED_FISHING_OPERATION') !== -1)){
                     comboList.push(rec);
                 }
            } else {
                 comboList.push(rec);
            }
        });
        
        return comboList;
    };

	var componentUtilsService = {
        convertCodelistToCombolist : convertCodelistToCombolist
    };
    
	return componentUtilsService;
});