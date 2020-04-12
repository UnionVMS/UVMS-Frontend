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
angular.module('unionvmsWeb').directive('groupedCombobox', function(comboboxService) {
    return {
        restrict: 'E',
        replace: true,
        require: "^ngModel",
        scope: {
            items : '=?',
            ngModel : '=?',
            initialtext : '@?',
            isLoading : '=?',
            name: '@?',
            uppercase: '@?'
            
        },
        templateUrl: 'directive/common/groupedCombobox/groupedCombobox.html',
        link: function(scope, element, attrs, ctrl) {
            scope.comboboxServ = comboboxService;
            scope.element = element;
            scope.initialitem = true;
            scope.currentItemEnabled = true;
            scope.isOpen = false;
            scope.isPlaceholderValueSelected = false;

         

            //Get the label for an item
            scope.getItemLabel = function(item) {
                return item.text;
            };

            //Get the code (id) for an item
            var getItemCode = function(item) {
                return item.code;
            };

             //Get the description for an item
             scope.getItemDesc = function(item) {
                return item.desc || item.text;
            };

            //Find initial value
            var getItemObjectByCode = function(code){
                for (var i = 0; i < scope.loadedItems.length; i++) {
                    if (scope.loadedItems[i].code === code){
                        return scope.loadedItems[i];
                    }
                }
            };

            //Add a default value as first item in the dropdown
            scope.addDefaultValueToDropDown = function() {
                if (scope.loadedItems !== undefined && scope.initialtext !== "") {
                    var initialValue = {};
                    initialValue.code = undefined;
                    initialValue.text = scope.initialtext;
                    scope.initialValue = initialValue;
                }
            };


            function loadLineStyleItems() {
            	scope.loadedItems = [{'code': 'solid', 'text': '5,0'},{'code': 'dashed', 'text': "10,5"},{'code': 'dotted', 'text': "5,5"},{'code': 'dotdashed', 'text': "5,5,10,5"}];
            }

            //Set the label of the dropdown based on the current value of ngMode
            scope.setLabel = function() {
                if ((!scope.ngModel  || (_.isArray(scope.ngModel) && scope.ngModel.length === 0)) && scope.initialtext) {
                    scope.currentItemLabel = scope.initialtext;
                }

                if (scope.loadedItems !== undefined) {
                    for (var i = 0; i < scope.loadedItems.length; i++) {
                        if (getItemCode(scope.loadedItems[i]) === scope.ngModel) {
                            scope.currentItemLabel = scope.getItemLabel(scope.loadedItems[i]);
                        }
                    }
                }
                //If no label found, show value of ngModel
                if (angular.isUndefined(scope.currentItemLabel)) {
                    scope.currentItemLabel = scope.ngModel;
                }
            };

            //Watch for changes to the ngModel and update the dropdown label
            scope.$watch(function () { 
                return scope.ngModel;
            }, function (newVal, oldVal) {

                if (!newVal || (_.isArray(newVal) && newVal.length === 0)) {
                    if (scope.initialtext) {
                        scope.currentItemLabel = scope.initialtext;
                    }
                   
                } else {
                    if (Array.isArray(scope.loadedItems)) {
                        var comboItems = scope.loadedItems;
                        for (var k = 0; k < comboItems.length; k++) {
                            if (angular.equals(newVal, getItemCode(comboItems[k]))) {
                                scope.currentItemLabel = scope.getItemLabel(comboItems[k]);
                                if (angular.isDefined(scope.banTitle)) {
                                    scope.currentItemEnabled = scope.isItemEnabled(comboItems[k]);
                                }
                                break;
                            }
                        }
                    }
                }
            });

            if (!scope.lineStyle) {
                scope.$watchCollection('items', function(newVal, oldVal) {
                    scope.isFilterActive = false;
                    if (newVal && newVal.length > 0) {
                        scope.loadedItems = newVal;

                        if (scope.uppercase) { 
                            for (var i=0;i<scope.loadedItems.length;i++) {
                                scope.loadedItems[i].text = scope.loadedItems[i].text.toUpperCase();
                            }
                        }

                       if (angular.isDefined(scope.ngModel)) {
                            var item = getItemObjectByCode(scope.ngModel);
                            if (angular.isDefined(item)) {
                                scope.currentItemLabel = scope.getItemLabel(item);
                                if (angular.isDefined(scope.banTitle)) {
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
                if (!angular.isDefined(scope.ngModel) || newVal !== oldVal) {
                    scope.currentItemLabel = newVal;
                }
            });

            scope.selectVal = function(selectedItem, isPlaceholderValue) {
                scope.isPlaceholderValueSelected = !isPlaceholderValue;
                scope.ngModel = getItemCode(selectedItem);
                scope.currentItemLabel = scope.getItemLabel(selectedItem);
                ctrl.$setViewValue(scope.ngModel);
                scope.toggleCombo();
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

            scope.toggleCombo = function(){
                scope.isOpen = !scope.isOpen;
                var isOpen = scope.isOpen ? scope : null;
                comboboxService.setActiveCombo(isOpen, 'grouped');
            };

            function init() {
                
                scope.selectFieldId = generateGUID();
                scope.comboboxId = "group-combo-" + scope.selectFieldId;

                $('.grouped-combo-list', element).attr('id', scope.comboboxId);
                var dest = 'body';
               
                $('#' + scope.comboboxId).appendTo(dest);
                ctrl.$setPristine();
                
               

                scope.setLabel();
                loadLineStyleItems();
                scope.addDefaultValueToDropDown();


                scope.$on('$destroy', function() {
                 
                    var comboToRemove = angular.element('#' + scope.comboboxId);
                    if (comboToRemove) {
                        comboToRemove.remove();
                    }
                });


            }

            init();
        }
    };
});
