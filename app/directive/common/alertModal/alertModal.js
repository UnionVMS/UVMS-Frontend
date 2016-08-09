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
                        resetModalStatus();
                        scope.modalInstance.close();
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