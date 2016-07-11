/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').directive('multiselectDropDown', function(locale) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            model: '=',
            options: '=',
            pre_selected: '=preSelected',
            checkall: '@',
            uncheckall: '@',
            initialtext: "@",
            ngdisabled : '@'
        },
        templateUrl: 'directive/common/multiselectDropDown/multiselectDropDown.html',
        link: function(scope, element, attrs, fn) {

            //Close dropdown when clicking outside of it
            var onClickOutsideMultiSelectDropdown = function(event){
                var isClickedElementChildOfPopup = element
                    .find(event.target)
                    .length > 0;

                if (isClickedElementChildOfPopup){
                    return;
                }

                scope.$apply(function(){
                    scope.open = false;
                });
            };

            scope.model = scope.model || [];
            scope.checkAndSelectAll = false;

            scope.disableCheckall = false;
            if(_.has(attrs, 'disablecheckall')){
                scope.disableCheckall = true;
            }

            scope.ngDisabled = false;
            if('ngdisabled' in attrs && (attrs.ngdisabled === "true" || attrs.ngdisabled === true )){
                scope.ngDisabled = true;
            }

            scope.selection = scope.initialtext || locale.getString("common.multiple_select_dropdown_default_text");
            scope.checkAll = scope.checkall;
            scope.unCheckAll = scope.uncheckall;

            scope.openDropdown = function(){
                for(var i=0; i<scope.pre_selected.length; i++){
                    scope.selectedItems.push(scope.pre_selected[i].text);
                }
            };

            scope.checkedAndSelectedAll = function() {
                return scope.options.length === scope.model.length;
            };

            scope.checkedAndSelectedNone = function() {
                return scope.model.length === 0;
            };

            scope.selectAll = function () {
                scope.model = _.pluck(scope.options, 'code');
            };

            scope.deselectAll = function() {
                scope.model = [];
            };

            scope.setSelectedItem = function(){
                var code = this.option.code;
                if (_.contains(scope.model, code)) {
                    scope.model = _.without(scope.model, code);
                } else {
                    scope.model.push(code);
                }

                return false;
            };

            scope.isChecked = function(code) {
                return _.contains(scope.model, code);
            };

            scope.dropdownLabel = function() {
                switch(scope.model.length) {
                    case 0:
                        return scope.initialtext || locale.getString("common.multiple_select_dropdown_default_text");
                    case scope.options.length:
                        return locale.getString('common.all_selected');
                    case 1:
                        return scope.model[0];
                    default:
                        return locale.getString('common.multiple_selected');
                }
            };

            var init = function(){
                $(document).bind('click', onClickOutsideMultiSelectDropdown);
            };

            var cleanup = function(){
                $(document).unbind('click', onClickOutsideMultiSelectDropdown);
            };

            init();

            scope.$on('$destroy', function() {
                cleanup();
            });
        }
    };
});