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

            scope.selectAll = function () {
                scope.model = _.pluck(scope.options, 'code');
                scope.setTitle();
                scope.checkAndSelectAll = true; 
            };            
            
            scope.deselectAll = function() {
                scope.model=[];
                scope.setTitle();
                scope.checkAndSelectAll = false; 
            };
            
            scope.setSelectedItem = function(){
                var code = this.option.code;
                if (_.contains(scope.model, code)) {
                    scope.model = _.without(scope.model, code);
                    scope.checkAndSelectAll = false; 
                } else {
                    scope.model.push(code);
                    if(scope.model.length === scope.options.length)
                    {
                        scope.checkAndSelectAll = true;
                    }
                }
                scope.setTitle();
                return false;
            };
           
            scope.isChecked = function (code) {                 
                if (_.contains(scope.model, code)) {
                    return true;
                }
                return false;
            };

            scope.setTitle = function(){
                switch(scope.model.length) {
                    case 0:
                        scope.selection = scope.initialtext || locale.getString("common.multiple_select_dropdown_default_text");
                        break;
                    case 1:
                        scope.selection = locale.getString('common.one_selected');
                        break;
                    default:
                        scope.selection = locale.getString('common.multiple_selected');
                        break;
                }                   
            };
        }
    };
});

