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
            disabledItems : '=',
            ngModel:'=',
            callback : '=',
            callbackParams : '=',
            ngDisabled : '=',
            tabIndex : '=', 
            ngRequired : '=', 
            name : '=',
            inputFieldId : '@'
		},
        templateUrl: 'directive/common/dropdown/dropdown.html',
		link: function(scope, element, attrs, fn, deepBlur) {

            scope.status = {
                isopen: false
            };

            scope.initialitem = true;
            if('noPlaceholderItem' in attrs){
                scope.initialitem = false;
            }

            //Should be able to select the initial text item?
            scope.initialtextSelectable = false;
            if('initialtextSelectable' in attrs){
                scope.initialtextSelectable = true;
            }

            //Should dropdown be treated like a menu?
            scope.menuStyle = false;
            if('menuStyle' in attrs){
                scope.menuStyle = true;
            }

            //Get the label for an item
            //Default item variable "text" is used if no title attr is set
            scope.getItemLabel = function(item){
                var label;
                if(attrs.title){
                    label = item[attrs.title];
                }else{
                    label = item.text;
                }
                return label;
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
                if ((scope.ngModel !== undefined && scope.ngModel === "") || scope.ngModel === null || scope.ngModel === undefined) {
                    if(attrs.initialtext){
                        scope.currentItemLabel = attrs.initialtext;
                    }else{
                        if (scope.ngModel){
                            scope.currentItemLabel = scope.getItemLabel(scope.ngModel);
                        }else{
                            if (scope.items){
                                scope.currentItemLabel = scope.getItemLabel(scope.items[0]);
                            }
                        }
                    }
                } else {
                    if(scope.items !== undefined){
                        for (var i = 0; i < scope.items.length; i++){
                            if(getItemCode(scope.items[i]) === scope.ngModel){
                                scope.currentItemLabel = scope.getItemLabel(scope.items[i]);
                            }
                        }
                    }
                    //If no label found, show value of ngModel
                    if(angular.isUndefined(scope.currentItemLabel)){
                        scope.currentItemLabel = scope.ngModel;
                    }
                }
            };

            //Watch for changes to the ngModel and update the dropdown label
            scope.$watch(function () { return scope.ngModel;}, function (newVal, oldVal) {
                if(newVal === null || newVal === undefined || newVal === ""){
                    if(attrs.initialtext){
                        scope.currentItemLabel = attrs.initialtext;
                        if(scope.menuStyle){
                            scope.setplaceholdercolor = false;
                        }else{
                            scope.setplaceholdercolor = true; //sets css class on first element. (placeholder)
                        }
                    }
                }else{
                    scope.setplaceholdercolor = false;
                    if(Array.isArray(scope.items)){
                        for(var i = 0; i < scope.items.length; i++){
                            if(angular.equals(newVal, getItemCode(scope.items[i])) ) {
                                scope.currentItemLabel = scope.getItemLabel(scope.items[i]);
                            }
                        }
                    }
                }
            });

            //Select item in dropdown
            scope.selectVal = function(item){
                //Disabled item
                if(scope.disableItem(item)){
                    return;
                }

                //Change ngModel and label value if not menu style
                if(!scope.menuStyle){
                    scope.ngModel = getItemCode(item);
                    scope.currentItemLabel = scope.getItemLabel(item);
                }
                if(angular.isDefined(scope.callback)){
                    var extraParams;
                    if(angular.isDefined(scope.callbackParams)){
                        extraParams = scope.callbackParams;
                    }
                    scope.callback(item, extraParams);
                }
            };

            //Add a default value as first item in the dropdown
            scope.addDefaultValueToDropDown = function(){
                if (scope.items !== undefined && attrs.initialtext !== ""){
                    var initialValue = {};
                    initialValue.code = undefined;
                    initialValue.text = attrs.initialtext;
                    scope.initialValue = initialValue;
                }
            };

            scope.disableItem = function(item){
                var itemCode = getItemCode(item);
                if(angular.isDefined(scope.disabledItems)){
                    if(scope.ngModel !== itemCode && scope.disabledItems.indexOf(itemCode) >= 0){
                        return true;
                    }
                }

                return false;
            };

            // Select dropdown items on focus
            scope.focusVal = function(item) {
                scope.focusedItem = item;
                if(angular.isDefined(scope.focusedItem)){
                    scope.selectVal(scope.focusedItem);
                }
            };

            // Close dropdown menu
            scope.closeDropdownMenu = function() {
                if(scope.status.isopen){
                    angular.element(scope.currentTarget).removeClass('open');
                    scope.status.isopen = false;
                }
            };

            // Add extra events to a toggled dropdown menu
            scope.toggleDropdown = function(e) {
                if(!scope.ngDisabled) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    angular.element(scope.currentTarget).toggleClass('open');
                    scope.currentTarget = event.currentTarget;
                    scope.status.isopen = !scope.status.isopen;
                } 
            };

            // Make sure dropdown isn't toggled on menu events
            scope.dropdownMenuClick = function() {
                scope.status.isopen = true;
            };

            // Close menu on enter 
            scope.dropdownMenuKeyboardEvent = function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if(e.keyCode === 13) {
                    scope.closeDropdownMenu();
                } 
            };

            scope.setLabel();
            //Create a list item with the initaltext?
            if(scope.initialitem && !scope.menuStyle){
                scope.addDefaultValueToDropDown();
            }  
		}
	};
});