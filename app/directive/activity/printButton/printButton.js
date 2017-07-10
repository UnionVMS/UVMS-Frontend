angular.module('unionvmsWeb').directive('printButton', function(fishingActivityService) {
	return {
		restrict: 'E',
		replace: true,
		scope: {

		},
		controller: 'printButtonCtrl',
		templateUrl: 'directive/activity/printButton/printButton.html',
		link: function(scope, element, attrs, fn) {
			scope.el = element;
		}
	};
}).controller('printButtonCtrl', function($scope,$compile){

    var closeTooltip = function(){
        $($($scope.el).scrollParent()).off('scroll', closeTooltip);
        $scope.api.destroy(true);
        delete $scope.tip;
    };
    
    $scope.openPrintForm = function(){
        $scope.tip = $scope.el.qtip({
            content: {
                /*text: $compile(angular.element($templateCache.get('directive/activity/printButton/printForm/printForm.html')))($scope)*/
				ajax: {
					url: 'directive/activity/printButton/printForm/printForm.html',
					success: function(data, status) {
                        var elemContent = angular.element('.print-tooltip > .qtip-content');
                        elemContent.empty();
                        elemContent.append($compile(angular.element(data))($scope));
					}
				}
            },
            position: {
                my: 'right top',
                at: 'left bottom',
                target: $scope.el,
                effect: false
            },
            show: {
                when: false,
                effect: false
            },
			hide: {
				event: 'unfocus'
			},
            events: {
				show: function(event, api) {
                    $scope.api = api;
                    $($($scope.el).scrollParent()).scroll(closeTooltip);
                },
                hide: function(event, api) {
                    closeTooltip();
                }
            },
            style: {
                classes: 'qtip-bootstrap print-tooltip'
            }
        });
    
        var api = $scope.tip.qtip('api');
        api.show();
    };
});
