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
		    var modalCtrl = function ($scope, $modalInstance){
		        $scope.data = {
		            msg: scope.displayMsg,
		            type: scope.displayType,
		            close: function(){
		                scope.ngModel = false;
		                scope.displayType = undefined;
	                    scope.displayMsg = undefined;
		                $modalInstance.close();
		            }
		        };
		        
		        if (angular.isDefined(scope.timeout)){
		            $timeout(function(){
		                $modalInstance.close();
		            }, parseInt(scope.timeout), true, $modalInstance);
		        }
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
	                resolve: function(){
	                    return scope.data;
	                }
	            });
		        
		        modalInstance.rendered.then(function(){
		            angular.element('.alert-modal-content').appendTo('#' + scope.targetElId);
		        });
		    };
		    
		    scope.$watch('ngModel', function(newVal){
		        if (newVal){
		            scope.open();
		        }
		    });
		}
	};
});