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
angular.module('unionvmsWeb').filter('stPurposeCode', function(mdrCacheService) {
    var cachedCodes = [];
    var images = {
        '1': 'fa-ban',
        '3': 'fa-trash-o',
        '5': 'fa-retweet',
        '9': 'fa-certificate'
    };
    var isFinished = false;
    var isInvoked = false;
    
    function realFilter(code, isImage){
        var filtered;
        if (angular.isDefined(code)){
            filtered = code;
            var rec = _.findWhere(cachedCodes, {code: code.toString()});
            if (angular.isDefined(rec)){
                if (isImage){
                    filtered = images[rec.code];
                } else {
                    filtered = rec.text;
                }
            }
        }
        return filtered;
    }
    
    function convertCode(mdrCode, isImage){
        if (!isFinished && !isInvoked){
            isInvoked = true;
            mdrCacheService.getCodeList('FLUX_GP_PURPOSE').then(function(response){
                angular.forEach(response, function(item){
                    cachedCodes.push({
                        code: item.code,
                        text: item.description
                    });
                });
                isFinished = true;
            }, cachedCodes);
            return;
        } else {
            return realFilter(mdrCode, isImage);
        }
    }
    
    convertCode.$stateful = true;
    return convertCode;
});

