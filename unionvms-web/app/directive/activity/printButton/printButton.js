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
/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name printButton
 * @param {Service} fishingActivityService - the fishing activity service <p>{@link unionvmsWeb.fishingActivityService}</p>
 * @desc
 *  A button used to print the current view
 */
angular.module('unionvmsWeb').directive('printButton', function(fishingActivityService) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
            viewToPrint: '='
		},
		controller: 'printButtonCtrl',
		templateUrl: 'directive/activity/printButton/printButton.html',
		link: function(scope, element, attrs, fn) {
			scope.el = element;
		}
	};
}).controller('printButtonCtrl', function($scope,$compile){

    /**
     * Close the tootlip
     *  
     *  @memberof printButton
     *  @private
     *  @alias closeTooltip
     */
    var closeTooltip = function(){
        $($($scope.el).scrollParent()).off('scroll', closeTooltip);
        $scope.api.destroy(true);
        delete $scope.tip;
    };
    
    /**
     * Create and show a tootlip with a form with the print details
     *  
     *  @memberof printButton
     *  @public
     *  @alias openPrintForm
     */
    $scope.openPrintForm = function(){
        $scope.tip = $scope.el.qtip({
            content: {
				text: ''
            },
            position: {
                my: 'top right',
                at: 'bottom center',
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
        var printForm = angular.element('<div><div ng-include="\'directive/activity/printButton/printForm/printForm.html\'"></div></div>');
        api.set('content.text', $compile(angular.element(printForm))($scope));
        api.show();
    };
});
