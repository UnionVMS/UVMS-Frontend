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
angular.module('unionvmsWeb').factory('alertModalService', function($timeout){
    var alertModalService = {
        setReference: function(id){
            this.sidePanelId = id;
        },
        clearReference: function(){
            delete this.sidePanelId;
        },
        setSize: function(){
            var panelWidth = parseInt(angular.element('#' + this.sidePanelId).css('width'));
            angular.element('.alert-modal-content .modal-content').css('margin-left', panelWidth + 20);
        },
        resizeModal: function(){
            var self = this;
            $timeout(function(){
                self.setSize();
            }, 100);
        }
    };
    
    return alertModalService;
})
.directive('alertModal', function($modal, $timeout, alertModalService) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
		    ngModel: '=',
		    targetElId: '@',
		    sidePanelId: '@',
		    timeout: '@',
		    displayMsg : '=',
		    displayType: '=' //one of danger, warning, success
		},
		require: 'ngModel',
		link: function(scope, element, attrs, ctrl) {
		    var resetModalStatus = function(){
		        scope.ngModel = false;
                scope.displayType = undefined;
                scope.displayMsg = undefined;
                alertModalService.clearReference();
		    };
		    
		    var modalCtrl = function ($scope, $modalInstance){
		        $scope.data = {
		            msg: scope.displayMsg,
		            type: scope.displayType,
		            close: function(){
		                resetModalStatus();
		                $modalInstance.close();
		                delete scope.modalInstance;
		            }
		        };
		    };
		    
		    scope.open = function(){
		        scope.modalInstance = $modal.open({
	                templateUrl: 'directive/common/alertModal/alertModal.html',
	                controller: modalCtrl,
	                animation: true,
	                backdrop: 'static',
	                keyboard: false,
	                size: 'lg',
	                windowClass: 'alert-modal-content',
	                backdropClass: 'alert-modal-backdrop',
					openedClass: 'alert-open',
	                resolve: function(){
	                    return scope.data;
	                }
	            });
		        
		        scope.modalInstance.rendered.then(function(){
		            angular.element('.alert-modal-content').appendTo('#' + scope.targetElId);
		            
		            if (angular.isDefined(scope.sidePanelId)){
		                alertModalService.setReference(scope.sidePanelId);
		                alertModalService.setSize();
		            }
		        });
		        
		        scope.modalInstance.result.then(function(){
		            resetModalStatus();
                    delete scope.modalInstance;
		        });
		        
		        if (angular.isDefined(scope.timeout)){
                    $timeout(function(){
						if(angular.isDefined(scope.modalInstance)){
							resetModalStatus();
							scope.modalInstance.close();
						}
                    }, parseInt(scope.timeout), true, scope.modalInstance);
                }
		    };
		    
		    scope.$watch('ngModel', function(newVal){
		        if (newVal){
		            scope.open();
		        }
		    });
		}
	};
});
