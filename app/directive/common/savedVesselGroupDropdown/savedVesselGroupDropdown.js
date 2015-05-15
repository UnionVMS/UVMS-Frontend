angular.module('unionvmsWeb').directive('savedVesselGroupDropdown', function(savedVesselGroupService) {
    return {
        restrict: 'E',
        replace: true,
        require: "^ngModel",
        scope: {
            ngModel:'=',
            callback : '=',
            ngDisabled : '=',
        },
        templateUrl: 'directive/common/savedVesselGroupDropdown/savedVesselGroupDropdown.html',
        link: function(scope, element, attrs, fn) {
        
            scope.items = savedVesselGroupService.getVesselGroupsForUser();

            scope.removeFromSelection = function(item){
                savedVesselGroupService.deleteVesselGroup(item);
            };

            //Get the label for an item
            //Default item variable "text" is used if no title attr is set
            scope.getItemLabel = function(item){
                    return item.name;
            };

            //Get the code (id) for an item
            //Default item variable "code" is used if no data attr is set
            var getItemCode = function(item){
                    return item.id;
            };


            //Set the label of the dropdown based on the current value of ngModel
            scope.setLabel = function() {
                if ((scope.ngModel !== undefined && scope.ngModel === "" ) || scope.ngModel === null || scope.ngModel === undefined) {
                    scope.currentItemLabel = attrs.initialtext;
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
                        if((newVal +'') === (getItemCode(scope.items[i]) +'')){
                            scope.currentItemLabel = scope.getItemLabel(scope.items[i]);
                        }
                    }
                }
            });

        //Watch for changes to the ngModel and update the dropdown label
            scope.$watch(function () { return savedVesselGroupService.getVesselGroupsForUser();}, function (newVal, oldVal) {
                if(newVal !== oldVal){
                    scope.items = newVal;
                }
            });


            //Select item in dropdown
            scope.selectVal = function(item){
                scope.ngModel = item.code;
                scope.currentItemLabel = scope.getItemLabel(item);
                if(angular.isDefined(scope.callback)){
                    scope.callback(item);
                }
            };

            scope.setLabel();

        }
    };
});

