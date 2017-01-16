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
angular.module('unionvmsWeb').filter('stPurposeCode', function() {
    var cachedCodes = [];
    function convertCode(mdrCode){
        if (angular.isDefined(mdrCode)){
            var rec = _.findWhere(cachedCodes, {code: mdrCode.toString()});
            var code;
            if (angular.isDefined(rec)){
                return rec.text;
            } else {
                cachedCodes = fecthCodes();
            }
        } else {
            //TODO fetch the codes from mdr rest service
            cachedCodes = fecthCodes();
        }
    }
    
    function fecthCodes(){
        return [{
            code: '1', text: 'Cancellation'
        },{
            code: '3', text: 'Delete'
        },{
            code: '5', text: 'Replacement (correction)'
        },{
            code: '9', text: 'Original report'
        }];
    }
    
    convertCode.$stateful = true;
    return convertCode;
});

