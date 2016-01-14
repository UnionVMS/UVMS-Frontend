angular.module('unionvmsWeb').directive('savedSearchDropdown', function() {
    return {
        restrict: 'E',
        replace: true,
        controller: "savedSearchDropdownCtrl",
        require: "^ngModel",
        scope: {
            type : "@",
            enableDelete : "@",
            ngModel:'=',
            callback : '=',
            ngDisabled : '=',
        },
        templateUrl: 'directive/common/savedSearchDropdown/savedSearchDropdown.html',
        link: function(scope, element, attrs, fn) {
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

            //Add a default value as first item in the dropdown
            scope.addDefaultValueToDropDown = function(){
                if (attrs.initialtext !== ""){
                    var initialTextItem = {};
                    initialTextItem.id = undefined;
                    initialTextItem.name = attrs.initialtext;
                    scope.initialValue = initialTextItem;
                }
            };

            //Select item in dropdown
            scope.selectVal = function(item){
                scope.ngModel = item.id;
                scope.currentItemLabel = scope.getItemLabel(item);
                if(angular.isDefined(scope.callback)){
                    scope.callback(item);
                }
            };

            //Create a list item with the initaltext?
            scope.addDefaultValueToDropDown();

            scope.setLabel();
        }
    };
});

angular.module('unionvmsWeb')
    .controller('savedSearchDropdownCtrl', function($scope, locale, savedSearchService, alertService, confirmationModal){

            //Get/set items and functions depending on type
            var deleteSuccessText, deleteErrorText;
            switch($scope.type) {
                case "VESSEL":
                    $scope.items = savedSearchService.getVesselGroupsForUser();
                    $scope.emptyPlaceholder = locale.getString('vessel.select_a_group_empty_placeholder');

                    //Delete a vessel group
                    $scope.removeSavedSearch = function(item){
                        savedSearchService.deleteVesselGroup(item).then(onDeleteSuccess, onDeleteError);
                    };
                    deleteSuccessText = locale.getString('vessel.save_group_delete_success');
                    deleteErrorText = locale.getString('vessel.save_group_delete_error');

                    //Watch for changes to the ngModel and update the dropdown label
                    $scope.$watch(function () { return savedSearchService.getVesselGroupsForUser();}, function (newVal, oldVal) {
                        if(newVal !== oldVal){
                            $scope.items = newVal;
                        }
                    });
                    break;
                case "MOVEMENT":
                    $scope.items = savedSearchService.getMovementSearches();
                    $scope.emptyPlaceholder = locale.getString('movement.advanced_search_placeholder_saved_searches_empty_placeholder');

                    //Delete a saved search
                    $scope.removeSavedSearch = function(item){
                        savedSearchService.deleteMovementSearch(item).then(onDeleteSuccess, onDeleteError);
                    };
                    deleteSuccessText = locale.getString('common.saved_search_delete_success');
                    deleteErrorText = locale.getString('common.saved_search_delete_error');

                    //Watch for changes to the ngModel and update the dropdown label
                    $scope.$watch(function () { return savedSearchService.getMovementSearches();}, function (newVal, oldVal) {
                        if(newVal !== oldVal){
                            $scope.items = newVal;
                        }
                    });
                    break;
                default:
                    console.error("Type is missing for saved search dropdown.");
            }

            //Delete a saved search
            $scope.deleteSavedSearch = function(item){
                var textLabel;
                if($scope.type === 'VESSEL'){
                    textLabel = locale.getString("vessel.save_group_delete_confirm_text", {name: item.name});
                }else if($scope.type === 'MOVEMENT'){
                    textLabel = locale.getString("common.saved_search_delete_confirm_text", {name: item.name});
                }
                var options = {
                    textLabel : textLabel
                };
                confirmationModal.open(function(){
                    $scope.removeSavedSearch(item);
                }, options);
            };

            //Success removing saved search
            var onDeleteSuccess = function(deletedGroup){
                alertService.showSuccessMessageWithTimeout(deleteSuccessText);
                if ($scope.ngModel === deletedGroup.id) {
                    $scope.ngModel = undefined;
                }
            };

            //Error removing saved search
            var onDeleteError = function(){
                alertService.showErrorMessage(deleteErrorText);
            };
    });