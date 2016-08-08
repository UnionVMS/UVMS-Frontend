angular.module('unionvmsWeb').directive('alertModal', function($modal, $timeout) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
		    ngModel: '=',
		    targetElId: '@',
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
		        } else if (!newVal && angular.isDefined(scope.modalInstance)) {
		            resetModalStatus();
		            scope.modalInstance.close();
		            delete scope.modalInstance;
		        }
		    });
		}
	};
});