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
                if ((scope.ngModel !== undefined && scope.ngModel === "" ) || scope.ngModel === null || scope.ngModel === undefined) {
                    scope.currentItemLabel = attrs.initialtext;
                } else {
                    if(scope.items !== undefined){
                        for (var i = 0; i < scope.items.length; i++){
                            if(scope.items[i].code === scope.ngModel)                        {
                                scope.currentItemLabel = scope.items[i].text;
                            }
                        }
                    }
                }
            };

            //Watch for changes to the ngModel
            scope.$watch(function () { return scope.ngModel;}, function (newVal, oldVal) {
                if (typeof newVal !== 'undefined') {
                    if(scope.ngModel !== null &&  scope.currentItemLabel !== attrs.initialtext){
                        for(var i = 0; i < scope.items.length; i++){
                            if(scope.ngModel === scope.items[i].code){
                                scope.currentItemLabel = scope.items[i].text;
                            }
                        }
                    }else{
                        scope.currentItemLabel = attrs.initialtext;
                    }
                }
            });

            scope.selectVal = function(item){
               scope.ngModel = item.code;
               scope.currentItemLabel = item.text;
            };

            scope.addDefaultValueToDropDown = function(){
                if (scope.items !== undefined && attrs.initialtext !== ""){
                    var initialValue = {};
                    initialValue.code = "";
                    initialValue.text = attrs.initialtext;
                    scope.items.unshift(initialValue);
                }
            };

            scope.setLabel();
            scope.addDefaultValueToDropDown();

          /*  scope.callback = function(func){
              func();
                if(typeof func == 'function'){
                    console.log("callbackfunction is called");
                }
            };
*/
		}
	};
});

