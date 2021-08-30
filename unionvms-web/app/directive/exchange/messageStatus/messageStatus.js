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
angular.module('unionvmsWeb').directive('messageStatus', function(locale, $modal, exchangeRestService) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
	        isClickable: '=',
	        ngModel: '=',
	        isResponseStatus: '='
		},
		templateUrl: 'directive/exchange/messageStatus/messageStatus.html',
		link: function(scope, element, attrs, fn) {
		    scope.openModal = function(){
		        if (scope.isClickable === true){
		            var modalInstance = $modal.open({
		               templateUrl: 'partial/exchange/validationResultsModal/validationResultsModal.html',
		               controller: 'ValidationresultsmodalCtrl',
		               size: 'lg',
		               resolve: {
		                   msgGuid: function(){
		                       return scope.ngModel.id;
		                   }
		               }
		            });
		        }
		    };

		    scope.getLabelText = function(){
		        if (!angular.isDefined(scope.ngModel.status) || scope.ngModel.status === null){
		            return "N/A";
                }
                var label = locale.getString('common.status_' + scope.ngModel.status.toLowerCase());
                if (isResponseStatusDefined()) {
                    if (scope.ngModel.responseStatus !== null && angular.isDefined(scope.ngModel.responseStatus)) {
                        label = locale.getString('common.status_' + scope.ngModel.responseStatus.toLowerCase());
                    } else {
                        label='';
                    }
                }

		        if (label === "%%KEY_NOT_FOUND%%"){
		           label = scope.ngModel.status;
		           if (isResponseStatusDefined() && (scope.ngModel.responseStatus !== null && angular.isDefined(scope.ngModel.responseStatus))) {
		               label = scope.ngModel.responseStatus;
		            }
		        } 
                return label;
		    };
		    
		    function isResponseStatusDefined() {
		        return scope.isResponseStatus !== null && angular.isDefined(scope.isResponseStatus) && scope.isResponseStatus===true;
		    }

		    scope.getLabelClass = function(){
		        var statusToCheck = scope.ngModel.status;
		         if (isResponseStatusDefined() && (scope.ngModel.responseStatus !== null && angular.isDefined(scope.ngModel.responseStatus))) {
                       statusToCheck = scope.ngModel.responseStatus;                   
                 }
		        var cssClass;
		        switch(statusToCheck){
		            case 'SUCCESSFUL' :
					case 'OK':
					case 'SENT':
					case 'ALLOWED':
		                cssClass = "label-success";
		                break;
		            case 'ERROR' :
		            case 'FAILED' :
		                cssClass = "label-danger";
		                break;
		            case 'BLOCKED':
		                cssClass = "label-blocked";
		                break;
		            default:
		                cssClass = "label-warning";
		                break;
		        }

		        if (angular.isDefined(scope.ngModel) && scope.isClickable === true){
		            cssClass += ' clickable-status';
		        }

		        return cssClass;
		    };
		}
	};
});
