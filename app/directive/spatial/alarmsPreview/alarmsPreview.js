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
