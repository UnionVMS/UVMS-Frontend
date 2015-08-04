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
                    case 0: return scope.initialtext || locale.getString("common.multiple_select_dropdown_default_text");
                    case 1: return locale.getString('common.one_selected');
                    default: return locale.getString('common.multiple_selected');
                }
            };
        }
    };
});
