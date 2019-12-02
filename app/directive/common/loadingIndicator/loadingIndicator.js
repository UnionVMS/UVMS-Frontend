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
angular.module('unionvmsWeb').directive('loadingIndicator', function($compile) {
    return {
        scope: {
            loadingIndicator: "=",
            message: "=",
            size: "@",
            type: "@"
        },
        restrict: 'A',
        link: function(scope, elem, attrs) {
            elem["0"].style.position = 'relative';
            var spinnerHTML;
            //SPINNER
            if(scope.type === "SPINNER"){
                spinnerHTML = '<i class="fa fa-spinner fa-spin fa-pulse"></i>';
            }
            //CIRCLE BOUNCE
            else if(scope.type === "BOUNCE"){
                spinnerHTML = '<div class="circle"></div><div class="circle"></div>';
            }
            //SHIP
            else{
                spinnerHTML = '<div class="spinningShipContainer"><div></div></div>';
            }

            elem.append($compile('<div ng-show="loadingIndicator" class="loadingIndicator" ng-class="size"><div class="spinnerOverlay"></div><div class="spinner">' +spinnerHTML +'</div><div class="loadingText" ng-show="message"><span ng-bind="message"></span></div></div>')(scope));
        }
    };
});

