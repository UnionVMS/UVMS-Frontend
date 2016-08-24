angular.module('unionvmsWeb').directive('stSimpleResetSearch', function() {
	return {
	    restrict: 'A',
        require: ['^stTable','^ngModel'],
        scope: {
            model: '=ngModel'
        },
        link: function (scope, element, attr, ctrl) {
            var tableCtrl = ctrl[0];
            var state = tableCtrl.tableState();
            scope.$watch('model', function(value){
                if (value === '' || !angular.isDefined(value)){
                    state.search.predicateObject = {};
                    state.pagination.start = 0;
                    tableCtrl.pipe();
                }
            });
        }
	};
});