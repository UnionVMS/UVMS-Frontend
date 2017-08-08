angular.module('unionvmsWeb').directive('messageStatus', function(locale) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
	        isClickable: '=',
	        ngModel: '='
		},
		templateUrl: 'directive/exchange/messageStatus/messageStatus.html',
		link: function(scope, element, attrs, fn) {
		    scope.getStatusLabel = function(status){
		        var label = locale.getString('common.status_' + status.toLowerCase());
		        if (label === "%%KEY_NOT_FOUND%%"){
		            label = status;
		        }
                return label;
		    };

		    scope.getStatusLabelClass = function(status){
		        var cssClass;
		        switch(status){
		            case 'SUCCESSFUL' :
		            case 'STARTED' :
		            case 'ONLINE':
		            case 'OK':
		                cssClass = "label-success";
		                break;
		            case 'OFFLINE':
		            case 'STOPPED':
		            case 'ERROR' :
		            case 'FAILED' :
		                cssClass = "label-danger";
		                break;
		            default:
		            cssClass = "label-warning";
		        }
		        
		        if (angular.isDefined(scope.ngModel) && scope.isClickable === true){
		            cssClass += ' clickable-status';
		        }
		        
		        return cssClass;
		    };

		}
	};
});
