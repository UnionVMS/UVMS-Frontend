angular.module('unionvmsWeb').directive('tableChart', function() {
	return {
		restrict: 'E',
		replace: false,
		scope: {
			columns: '=',
			ngModel: '=',
			selectedItem: '='
		},
		templateUrl: 'directive/activity/tableChart/tableChart.html',
		link: function(scope, element, attrs, fn) {
			scope.mode = 'table';

			scope.selectRow = function(idx){
				angular.forEach(scope.ngModel, function(item){
					delete item.selected;
				});
				scope.ngModel[idx].selected = true;

				if(angular.isDefined(scope.selectedItem)){
					scope.selectedItem = scope.ngModel[idx];
				}
			};

			scope.switchMode = function(){
				if(scope.mode === 'table'){
					scope.mode = 'chart';
				}else{
					scope.mode = 'table';
				}
			};

		}
	};
});
