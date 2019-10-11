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
angular.module('unionvmsWeb').directive('groupedCombobox', function(comboboxService,locale) {
    return {
        restrict: 'E',
        replace: true,
        require: "^ngModel",
        scope: {
            items : '=',
            disabledItems : '=',
            ngModel : '=',
            callback : '=',
            callbackParams : '=',
            ngDisabled : '=',
            lineStyle : '=',
            destComboList : '@',
            editable : '=',
            uppercase : '=',
            initialtext : '@',
            isLoading : '=',
            name: '@',
            comboSection: '@',
            initCallback: '=',
            noPlaceholderOnList: '@',
            defaultValue: '=',
            hideSelectedItems: '@',
            minSelections: '=',
            listClass: '@',
            banTitle: '@'
        },
        templateUrl: 'directive/common/groupedCombobox/groupedCombobox.html',
        link: function(scope, element, attrs, ctrl) {
            scope.comboboxServ = comboboxService;
            scope.element = element;
            scope.initialitem = true;
            scope.currentItemEnabled = true;

            if(!angular.isDefined(scope.listClass)){
                scope.listClass = '';
            }

            if(scope.uppercase){
                if(angular.isDefined(scope.initialtext)){
                    scope.initialtext = scope.initialtext.toUpperCase();
                }
                if(angular.isDefined(scope.items) && scope.items.length > 0){
                    for(var i=0;i<scope.items.length;i++){
                        scope.items[i].text = scope.items[i].text.toUpperCase();
                    }
                }
            }

            if(scope.noPlaceholderOnList){
                scope.initialitem = false;
            }

            if(scope.editable){
                scope.placeholder = scope.initialtext;
                scope.newItem = {text : ""};
            }

            if(scope.defaultValue){
                scope.ngModel = scope.defaultValue;
            }

            //Get the label for an item
            scope.getItemLabel = function(item){
                return item.text;
            };

            //Get the code (id) for an item
            var getItemCode = function(item){
                return item.code;
            };

            //Get the description for an item
            scope.getItemDesc = function(item){
                if(item.desc){
                    return item.desc;
                }else{
                    return item.text;
                }
            };

            //Check if item is enabled to show/hide icon on combo item
            scope.isItemEnabled = function (item) {
                var status = true;
                if (angular.isDefined(item.enabled)){
                    status = item.enabled;
                }
                return status;
            };

            //Find initial value
            var getItemObjectByCode = function(code){
                for (var i = 0; i < scope.loadedItems.length; i++){
                    if (scope.loadedItems[i].code === code){
                        return scope.loadedItems[i];
                    }
                }
            };

            //Set the label of the dropdown based on the current value of ngMode
            scope.setLabel = function() {
                if ((!scope.ngModel  || (_.isArray(scope.ngModel) && scope.ngModel.length === 0)) && scope.initialtext) {
                    scope.currentItemLabel = scope.initialtext;
                }

                if(scope.loadedItems !== undefined){
                    for (var i = 0; i < scope.loadedItems.length; i++){
                        if(getItemCode(scope.loadedItems[i]) === scope.ngModel){
                            scope.currentItemLabel = scope.getItemLabel(scope.loadedItems[i]);
                            if (angular.isDefined(scope.banTitle)){
                                scope.currentItemEnabled = scope.isItemEnabled(scope.loadedItems[i]);
                            }
                        }
                    }
                }
                //If no label found, show value of ngModel
                if(angular.isUndefined(scope.currentItemLabel)){
                    scope.currentItemLabel = scope.ngModel;
                    if (angular.isDefined(scope.banTitle)){
                        scope.currentItemEnabled = true;
                    }
                }
            };

            //Watch for changes to the ngModel and update the dropdown label
            scope.$watch(function () { return scope.ngModel;}, function (newVal, oldVal) {

                if(!newVal || (_.isArray(newVal) && newVal.length === 0)){
                    if(scope.initialtext){
                        scope.currentItemLabel = scope.initialtext;
                        if (angular.isDefined(scope.banTitle)){
                            scope.currentItemEnabled = true;
                        }
                        scope.setplaceholdercolor = true; //sets css class on first element. (placeholder)
                    }
                    if(scope.editable){
                        scope.newItem = {};
                    }
                    if (!scope.initialtext && !scope.editable){
                        scope.currentItemLabel = undefined;
                        if (angular.isDefined(scope.banTitle)){
                            scope.currentItemEnabled = true;
                        }
                    }
                }else{
                    scope.setplaceholdercolor = false;
                    if(Array.isArray(scope.loadedItems)){
                        var comboItems = scope.loadedItems;
                        for(var k = 0; k < comboItems.length; k++){
                            if(scope.editable){
                                if(scope.comboForm.comboEditableInput.$dirty){
                                    scope.isFilterActive = true;
                                }
                                if(angular.equals(newVal, scope.getItemLabel(comboItems[k]))) {
                                    scope.newItem.text = scope.getItemLabel(comboItems[k]);
                                    if (angular.isDefined(scope.banTitle)){
                                        scope.currentItemEnabled = scope.isItemEnabled(comboItems[k]);
                                    }
                                    break;
                                }
                            } else{
                                if(angular.equals(newVal, getItemCode(comboItems[k]))) {
                                    scope.currentItemLabel = scope.getItemLabel(comboItems[k]);
                                    if (angular.isDefined(scope.banTitle)){
                                        scope.currentItemEnabled = scope.isItemEnabled(comboItems[k]);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            });

            if(!scope.lineStyle){
                scope.$watchCollection('items', function(newVal, oldVal){
                    scope.isFilterActive = false;
                    if (newVal && newVal.length > 0){
                        scope.loadedItems = newVal;

                        if(scope.uppercase){
                            for(var i=0;i<scope.loadedItems.length;i++){
                                scope.loadedItems[i].text = scope.loadedItems[i].text.toUpperCase();
                            }
                        }

                       if(angular.isDefined(scope.ngModel)){
                            var item = getItemObjectByCode(scope.ngModel);
                            if (angular.isDefined(item)){
                                scope.currentItemLabel = scope.getItemLabel(item);
                                if (angular.isDefined(scope.banTitle)){
                                    scope.currentItemEnabled= scope.isItemEnabled(item);
                                }
                            }
                        }
                    } else {
                        scope.loadedItems = [];
                    }
                },true);
            }

            scope.$watch('initialtext',function(newVal,oldVal){
                if(!angular.isDefined(scope.ngModel) || newVal !== oldVal){
                    scope.currentItemLabel = newVal;
                }
            });

            //Select item in dropdown
            scope.selectVal = function(item){
                //Disabled item
                if(scope.disabledItem(item)){
                    return;
                }

                ctrl.$setDirty();
                if(scope.editable){
                    if(angular.isDefined(item.code)){
                        scope.newItem.text = item.text;
                    }else{
                        scope.newItem.text = '';
                    }
                    scope.ngModel = scope.newItem.text;
                    ctrl.$setViewValue(scope.ngModel);
                    scope.toggleCombo();
                }else{
                    scope.ngModel = getItemCode(item);
                    scope.currentItemLabel = scope.getItemLabel(item);
                    ctrl.$setViewValue(scope.ngModel);
                    scope.toggleCombo();
                }

                /*scope.toggleCombo();*/
                testAndRunCallback(item);
            };

            //Add a default value as first item in the dropdown
            scope.addDefaultValueToDropDown = function(){
                if (scope.loadedItems !== undefined && scope.initialtext !== ""){
                    var initialValue = {};
                    initialValue.code = undefined;
                    initialValue.text = scope.initialtext;
                    scope.initialValue = initialValue;
                }
            };

            scope.disabledItem = function(item){
                var itemCode = getItemCode(item);
                if(angular.isDefined(scope.disabledItems)){
                    if(scope.ngModel !== itemCode && scope.disabledItems.indexOf(itemCode) >= 0){
                        return true;
                    }
                }

                return false;
            };

            function generateGUID() {
                function s4() {
                  return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                  s4() + '-' + s4() + s4() + s4();
              }

            scope.toggleCombo = function(evt){
                if( evt && evt.target && evt.target.className.indexOf('item-remover') !== -1){
                    return;
                }

                scope.isOpen = !scope.isOpen;
                if(scope.isOpen){
                    comboboxService.setActiveCombo(scope);
                }else{
                    comboboxService.setActiveCombo(null);
                }
            };

            function closeCombo() {
                scope.isOpen = false;
                scope.comboboxServ.setActiveCombo(null);
            }

            function loadLineStyleItems() {
                scope.loadedItems = [{'code': 'solid', 'text': '5,0'},{'code': 'dashed', 'text': "10,5"},{'code': 'dotted', 'text': "5,5"},{'code': 'dotdashed', 'text': "5,5,10,5"}];
            }

            function testAndRunCallback(item){
                if(angular.isDefined(scope.callback)){
                    var extraParams;
                    if(angular.isDefined(scope.callbackParams)){
                        extraParams = scope.callbackParams;
                    }
                    scope.callback(item, extraParams);
                }
            }

            var init = function(){
                scope.selectFieldId = generateGUID();
                scope.comboboxId = "combo-" + scope.selectFieldId;

                $('.comboList', element).attr('id', scope.comboboxId);
                var dest = 'body';
                if(scope.destComboList){
                    dest = scope.destComboList;
                }
                $('#' + scope.comboboxId).appendTo(dest);
                ctrl.$setPristine();
                if(scope.lineStyle !== undefined && scope.lineStyle === true){
                    loadLineStyleItems();
                }else{
                    scope.loadedItems = scope.items ? scope.items : [];
                }

                scope.setLabel();

                //Create a list item with the initaltext?
                if(scope.initialitem){
                    scope.addDefaultValueToDropDown();
                }

                scope.$on('$destroy', function() {
                    if(scope.group){
                        scope.comboboxServ.removeCombo(scope.group,scope);
                    }
                    var comboToRemove = angular.element('#' + scope.comboboxId);
                    if(comboToRemove){
                        comboToRemove.remove();
                    }
                });


            };

            init();
            if(angular.isDefined(scope.initCallback)){
                scope.initCallback(scope.comboboxId);
            }
        }
    };
});
