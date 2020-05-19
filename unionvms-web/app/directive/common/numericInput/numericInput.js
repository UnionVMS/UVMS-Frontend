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
angular.module('unionvmsWeb').directive('numericInput',['$compile', function($compile) {
	return {
		restrict: 'E',
		replace: true,
        require: "ngModel",
		controller: 'numericInputCtrl',
		scope: {
            ngModelNumber: '=ngModel',
            ngChange: '&',
            min: '=',
            max: '=',
            ngRequired: '=',
            step: '@',
			ngDisabled: '=',
			name: '@'
		},
		templateUrl: 'directive/common/numericInput/numericInput.html',
		link: function(scope, element, attrs, ctrl) {
			scope.elem = element;
			
			if(!angular.isDefined(scope.step)){
				scope.step = 1;
			}
			
			if(_.keys(attrs.$attr).length){
				var inputNumber = element.find('input[type="number"]');
				angular.forEach(attrs.$attr, function(value,key) {
					if(value==='class'){
						element.find('input[type="text"]').attr(value, attrs[key]);
					}else if(value!=='ng-model' && value!=='ng-required'){
						inputNumber.attr(value, attrs[key]);
					}
					element.removeAttr(value);
				});
				$compile(element)(scope);
			}
			
			if(angular.isDefined(scope.min) && !_.isNumber(scope.min)){
				delete scope.min;
			}
			if(angular.isDefined(scope.max) && !_.isNumber(scope.max)){
				delete scope.max;
			}
			
			scope.changedNumberValue = true;
			scope.textValue = angular.isDefined(scope.ngModelNumber) ? scope.ngModelNumber.toString() : '';
		}
	};
}]);

angular.module('unionvmsWeb').controller('numericInputCtrl',['$scope','$interval', function($scope,$interval){
	
	//Watch for changes to the ngModelNumber and validate value
	$scope.$watch(function() { return $scope.ngModelNumber;}, function(newVal, oldVal) {
		if(_.isString(newVal)){
			$scope.ngModelNumber = parseFloat(newVal);
			return;
		}
		if($scope.ngChange){
			try{
				$scope.$eval($scope.ngChange);
			}catch(err){}
		}
		
		if(newVal !== oldVal && !_.isNaN(newVal) && !$scope.changedTextValue){
    		if(angular.isDefined(newVal)){
    			if(_.isNumber(newVal)){
    				if(parseFloat($scope.textValue) !== newVal){
    					if(!$scope.changedTextValue){
	    					$scope.changedNumberValue = true;
	    					$scope.textValue = '' + newVal;
    					}
    				}
    			}else{
    				if(!$scope.changedTextValue){
	    				$scope.changedNumberValue = true;
	    				$scope.textValue = '';
    				}
    			}
    		}else{
    			if(!$scope.changedTextValue){
	    			$scope.changedNumberValue = true;
	    			$scope.textValue = '';
    			}
    		}
    	}
		$scope.changedTextValue = false;
    });
	
	$scope.removeSpaces = function(e) {
	    if(e.which === 32){
	    	event.preventDefault();
	        return false;
	    }
	};
	
	$scope.checkKeys = function(e) {
	    if(e.which === 38){
	    	$scope.spinnerAction('+');
	    	e.preventDefault();
	        return false;
	    }else if(e.which === 40){
	    	$scope.spinnerAction('-');
	    	e.preventDefault();
	        return false;
	    }
	};
	
	$scope.spinnerAction = function(type) {
		if(!angular.isDefined($scope.promise)){
			$scope.spinnerType = type;
			spinnerChange();
			$scope.promise = $interval(spinnerChange, 100);
		}
	};
	
	$scope.mouseUp = function () {
		if(angular.isDefined($scope.promise)){
	        $interval.cancel($scope.promise);
	        $scope.promise = undefined;
		}
     };
     
    var spinnerChange = function(){
		$scope.ctrl.$setDirty();

		var aux;
    		
		if(angular.isDefined($scope.ngModelNumber) && $scope.ngModelNumber !== null){
			aux = angular.copy($scope.ngModelNumber);
		}else{
			aux = 0;
		}
		
		var auxStr = aux.toString();
		if(auxStr.length>17){
			aux = parseFloat(auxStr.substring(0, 17));
		}
		
		aux = calcValue(aux,$scope.step,$scope.spinnerType);
		
		if(angular.isDefined($scope.min) && parseFloat($scope.min) > aux){
			aux = parseFloat($scope.min);
		}
		if(angular.isDefined($scope.max) && parseFloat($scope.max) < aux){
			aux = parseFloat($scope.max);
		}
		
		$scope.ngModelNumber = aux;
    };
    
    var calcValue = function(value,step,type){
    	step = step === 'any'? step : parseFloat(step);
    	var nrDecimals = 0;
    	var nrDecimalsValue = value.countDecimals();
    	var nrDecimalsStep = step === 'any'? value.countDecimals() : step.countDecimals();
    	
    	if(nrDecimalsValue > nrDecimalsStep){
    		nrDecimals = nrDecimalsValue;
    	}else{
    		nrDecimals = nrDecimalsStep;
    	}
    	
    	value = parseFloat(value.toString().replace('.',''));
    	if(nrDecimalsValue < nrDecimalsStep){
    		value *= Math.pow(10,nrDecimalsStep-nrDecimalsValue);
    	}
    	
    	step = step === 'any' ? Math.pow(10,nrDecimalsValue-nrDecimalsStep) : step*Math.pow(10,nrDecimals);

    	if(type==='+'){
    		value += step;
    	}else{
    		value -= step;
    	}
    	
    	value /= Math.pow(10,nrDecimals);
    	
    	return value;
    };
    
	$scope.$watch(function() { return $scope.textValue;}, function(newVal, oldVal) {
		if(angular.equals(newVal, oldVal)){
			if(angular.isDefined(newVal) && newVal.indexOf('e-') !== -1){
				$scope.textValue = toFixed(newVal).toString();
			}
			$scope.changedNumberValue = false;
			return;
		}else{
			if(angular.isDefined(newVal) && newVal !== ''){
				if(newVal.indexOf('e-') !== -1){
					$scope.textValue = toFixed(newVal).toString();
					$scope.changedNumberValue = false;
					return;
				}
				var valueNoLetters = angular.copy(newVal);
				valueNoLetters = valueNoLetters.replace(/[^0-9.-]/g, '');
				
				if(valueNoLetters.split('.').length > 2 || valueNoLetters.charAt(0) === '.' || valueNoLetters.charAt(valueNoLetters.length - 1) === '-'){
					if(!$scope.changedNumberValue || parseFloat(valueNoLetters) !== $scope.ngModelNumber){
						$scope.changedTextValue = true;
						$scope.ngModelNumber = undefined;
					}
				}
				
				if(!angular.equals(newVal, valueNoLetters)){
					$scope.textValue = valueNoLetters;
				}else{
					if(!$scope.changedNumberValue || parseFloat(valueNoLetters) !== $scope.ngModelNumber){
						$scope.changedTextValue = true;
						$scope.ngModelNumber = parseFloat(newVal);
					}
				}
			}else{
				if(!$scope.changedNumberValue || parseFloat(newVal) !== $scope.ngModelNumber){
					$scope.changedTextValue = true;
					$scope.ngModelNumber = null;
				}
			}
		}
		$scope.changedNumberValue = false;
    });
	
	Number.prototype.countDecimals = function () {
	    if(Math.floor(this.valueOf()) === this.valueOf()){return 0;}
	    return this.toString().split(".")[1].length || 0; 
	};
	
	function toFixed(x) {
		var negative = false;
		if(x < 0){
			negative = true;
			x = Math.abs(x);
		}
		var e;
		if (Math.abs(x) < 1.0) {
			e = parseInt(x.toString().split('e-')[1]);
			if (e) {
				x *= Math.pow(10,e-1);
				x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
			}
		} else {
			e = parseInt(x.toString().split('+')[1]);
			if (e > 20) {
				e -= 20;
				x /= Math.pow(10,e);
				x += (new Array(e+1)).join('0');
			}
		}
		
		if(negative){
			x = '-' + x;
		}
		
		return x;
	}
    
}]);

angular.module('unionvmsWeb').directive('textInputStatus',function() {
  return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
		  scope.ctrl = ctrl;
    	  var updateFieldStatus = function(value) {
    		  var re = /^[-]?\d+(\.?\d*)?$/g;
    		  if(re.test(value) || !value){
    			  ctrl.$setValidity('invalidNumber',true);
    		  }else{
    			  ctrl.$setValidity('invalidNumber',false);
    		  }
              return value;
          };
          ctrl.$parsers.push(updateFieldStatus);
          ctrl.$formatters.push(updateFieldStatus);
      }
  };
});

angular.module('unionvmsWeb').directive('validateMinInRange', function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, el, attrs, ctrl){
            function checkMinValue(min, max){
                var valid = true;
                if (min !== undefined && max!== undefined && min !== null && max !== null && min > max){
                    valid = false;
                }
                
                ctrl.$setValidity('minBiggerThanMax', valid);
            }
            
            scope.$watch('max', function(newValue){
                checkMinValue(scope.ngModelNumber, newValue);
            });
            
            var checkValidity = function(min){
                checkMinValue(min, scope.max);
                return min;
            };
            
            ctrl.$parsers.push(checkValidity);
            ctrl.$formatters.push(checkValidity);
        }
    };
});

