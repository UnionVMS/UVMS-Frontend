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
angular.module('unionvmsWeb').directive('alarmsPreview', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
		    record: '='
		},
		templateUrl: 'directive/spatial/alarmsPreview/alarmsPreview.html',
		controller: 'alarmspreviewCtrl',
        link: function(scope, element, attrs, fn) {
            scope.el = element;
        }
	};
})
.controller('alarmspreviewCtrl', ['$scope', '$templateRequest', 'mapService', 'locale', function($scope, $templateRequest, mapService, locale){
    $scope.click = function(){
        $scope.createTip();
    };
    
    var buildTipHtml = function(api){
        $templateRequest('partial/spatial/templates/alarms.html').then(function(template){
            var data = mapService.setAlarmsObjPopup($scope.record.properties, false);
            
            var rendered = '<div class="alarms-preview">' + Mustache.render(template, data) + '</div>';
            api.set('content.text', rendered);
        });
    };
    
    $scope.createTip = function(){
        $scope.tip = $scope.el.qtip({
            content: {
                text: function(evt, api){
                    buildTipHtml(api);
                    var html = '<i class="fa fa-spinner fa-spin"></i>&nbsp;';
                    html += '<span>' + locale.getString('spatial.loading_data') + '</span>'; 
                    return html;
                }
            },
            position: {
                my: 'left center',
                at: 'right center',
                target: $scope.el,
                effect: false
            },
            show: {
                when: false,
                effect: false
            },
            events: {
                hide: function(event, api) {
                    api.destroy(true); // Destroy it immediately
                    delete $scope.tip;
                }
            },
            style: {
                classes: 'qtip-bootstrap'
            }
        });
    
        var api = $scope.tip.qtip('api');
        api.show();
    };
}]);

