angular.module('unionvmsWeb')
    .directive('dropdown', function() {
	return {
		restrict: 'E',
		replace: true,
        require: "^ngModel",
		scope: {
            items : '=',
            ngModel:'='
		},
		templateUrl: 'directive/common/dropdown/dropdown.html',
		link: function(scope, element, attrs, fn) {

            scope.setLabel = function() {
                if (scope.ngModel === "") {
                    scope.currentItemLabel = attrs.initialtext;
                } else {
                    for (var i = 0; i < scope.items.length; i++){
                        console.log(scope.items[i].text);
                        if(scope.items[i].text === scope.ngModel)                        {
                            scope.currentItemLabel = scope.items[i].text;
                        }
                    }
                }
            };

            scope.selectVal = function(item){
                scope.ngModel = item.code;
                scope.currentItemLabel = item.text;
            };

            scope.setLabel();
		}
	};
});

