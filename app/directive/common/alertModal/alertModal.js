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
		link: function(scope, element, attrs, ngModel) {
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
		            }
		        };
		    };
		    
		    scope.open = function(){
		        var modalInstance = $modal.open({
	                templateUrl: 'directive/common/alertModal/alertModal.html',
	                controller: modalCtrl,
	                animation: true,
	                backdrop: 'static',
	                keyboard: false,
	                size: 'lg',
	                windowClass: 'alert-modal-content',
	                backdropClass: 'alert-modal-backdrop',
					//appendTo: angular.element('#' + scope.targetElId),
	                resolve: function(){
	                    return scope.data;
	                }
	            });
		        
		        modalInstance.rendered.then(function(){
		            angular.element('.alert-modal-content').appendTo('#' + scope.targetElId);
		        });
		        
		        if (angular.isDefined(scope.timeout)){
                    $timeout(function(){
                        resetModalStatus();
                        modalInstance.close();
                    }, parseInt(scope.timeout), true, modalInstance);
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