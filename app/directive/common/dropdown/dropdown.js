angular.module('unionvmsWeb')
    .directive('dropdown', function() {
	return {
		restrict: 'E',
		replace: true,
        require: "^ngModel",
		scope: {
            items : '=',
            ngModel:'=',
            callback : '=',
            ngDisabled : '='
		},
		templateUrl: 'directive/common/dropdown/dropdown.html',
		link: function(scope, element, attrs, fn) {

            scope.title = attrs.title;
            if('noPlaceholderItem' in attrs){
                scope.initialitem = false;
            }else{
                scope.initialitem = true;
            }

            scope.setLabel = function() {
                if ((scope.ngModel !== undefined && scope.ngModel === "" ) || scope.ngModel === null || scope.ngModel === undefined) {
                    scope.currentItemLabel = attrs.initialtext;
                } else {
                    if(scope.items !== undefined){
                        for (var i = 0; i < scope.items.length; i++){
                            if(scope.items[i].code === scope.ngModel){
                                scope.currentItemLabel = scope.items[i].text;
                            }
                        }
                    }
                }
            };

            //Watch for changes to the ngModel
            scope.$watch(function () { return scope.ngModel;}, function (newVal, oldVal) {
                if (typeof newVal !== 'undefined') {
                    if(newVal === null || newVal === undefined || newVal === ""){
                        scope.currentItemLabel = attrs.initialtext;
                    }else{
                        for(var i = 0; i < scope.items.length; i++){
                            if((newVal +'') === (scope.items[i].code +'')){
                                scope.currentItemLabel = scope.items[i].text;
                            }
                        }
                    }
                }
            });

            scope.selectVal = function(item){
               scope.ngModel = item.code;
               scope.currentItemLabel = scope.title ? item[scope.title] : item.text;
               if(angular.isDefined(scope.callback)){
                    scope.callback(item);
               }
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

            //Create a list item with the initaltext?
            if(scope.initialitem){
                scope.addDefaultValueToDropDown();
            }        

		}
	};
});

