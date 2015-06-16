/**
* Attributes used in the directive:
* - noPlaceholderItem : use when you dont want to add a defaultItem to the dropdown
* - title: sets which item attribute that should be used as the item label. If it's not set then "text" is used
* - code: sets which item attribute that should be used as the item code. If it's not set then "code" is used
*/

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

            scope.initialitem = true;
            if('noPlaceholderItem' in attrs){
                scope.initialitem = false;
            }

            //Should be able to select the initial text item?
            scope.initialtextSelectable = false;
            if('initialtextSelectable' in attrs){
                scope.initialtextSelectable = true;
            }

            //Get the label for an item
            //Default item variable "text" is used if no title attr is set
            scope.getItemLabel = function(item){
                if(attrs.title){
                    return item[attrs.title];
                }else{
                    return item.text;
                }
            };

            //Get the code (id) for an item
            //Default item variable "code" is used if no data attr is set
            var getItemCode = function(item){
                if(attrs.data){
                    return item[attrs.data];
                }else{
                    return item.code;
                }
            };

            //Set the label of the dropdown based on the current value of ngMode
            scope.setLabel = function() {
                if ((scope.ngModel !== undefined && scope.ngModel === "" ) || scope.ngModel === null || scope.ngModel === undefined) {
                    if(attrs.initialtext){
                        scope.currentItemLabel = attrs.initialtext;
                    }else{
                        scope.currentItemLabel = scope.getItemLabel(scope.items[0]);
                    }
                } else {
                    if(scope.items !== undefined){
                        for (var i = 0; i < scope.items.length; i++){
                            if(getItemCode(scope.items[i]) === scope.ngModel){
                                scope.currentItemLabel = scope.getItemLabel(scope.items[i]);
                            }
                        }
                    }
                }
            };

            //Watch for changes to the ngModel and update the dropdown label
            scope.$watch(function () { return scope.ngModel;}, function (newVal, oldVal) {
                if(newVal === null || newVal === undefined || newVal === ""){
                    if(attrs.initialtext){
                        scope.currentItemLabel = attrs.initialtext;
                    }
                }else{
                    for(var i = 0; i < scope.items.length; i++){
                        if(angular.equals(newVal, getItemCode(scope.items[i])) ) {
                            scope.currentItemLabel = scope.getItemLabel(scope.items[i]);
                        }
                    }
                }
            });


            //Select item in dropdown
            scope.selectVal = function(item){
                scope.ngModel = getItemCode(item);
                scope.currentItemLabel = scope.getItemLabel(item);
                if(angular.isDefined(scope.callback)){
                    scope.callback(item);
                }
            };

            //Add a default value as first item in the dropdown
            scope.addDefaultValueToDropDown = function(){
                if (scope.items !== undefined && attrs.initialtext !== ""){
                    var initialValue = {};
                    initialValue.code = "";
                    initialValue.text = attrs.initialtext;
                    scope.initialValue = initialValue;
                    //scope.items.unshift(initialValue);
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

