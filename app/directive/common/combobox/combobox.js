angular.module('unionvmsWeb').directive('combobox', function($window, comboboxService) {
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
            destComboList : '='
		},
        templateUrl: 'directive/common/combobox/combobox.html',
		link: function(scope, element, attrs, ctrl) {

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
                if ((scope.ngModel !== undefined && scope.ngModel === "") || scope.ngModel === null || scope.ngModel === undefined) {
                    if(attrs.initialtext){
                        scope.currentItemLabel = attrs.initialtext;
                    }else{
                        if (scope.ngModel){
                            scope.currentItemLabel = scope.getItemLabel(scope.ngModel);
                        }else{
                            if (scope.loadedItems){
                                scope.currentItemLabel = scope.getItemLabel(scope.loadedItems[0]);
                            }
                        }
                    }
                }
                if(scope.loadedItems !== undefined){
                    if (scope.loadedItems.length === 0){
                        var tempFn = scope.$watch('items', function(newVal, oldVal){
                            if (newVal.length > 0){
                            	scope.loadedItems = newVal;
                                var item = getItemObjectByCode(scope.ngModel);
                                if (angular.isDefined(item)){
                                    scope.currentItemLabel = scope.getItemLabel(item);
                                }
                                tempFn();
                            }
                        });
                    }
                    
                    for (var i = 0; i < scope.loadedItems.length; i++){
                        if(getItemCode(scope.loadedItems[i]) === scope.ngModel){
                            scope.currentItemLabel = scope.getItemLabel(scope.loadedItems[i]);
                        }
                    }
                }
                //If no label found, show value of ngModel
                if(angular.isUndefined(scope.currentItemLabel)){
                    scope.currentItemLabel = scope.ngModel;
                }
            };

            //Watch for changes to the ngModel and update the dropdown label
            scope.$watch(function () { return scope.ngModel;}, function (newVal, oldVal) {
                if(newVal === null || newVal === undefined || newVal === ""){
                    if(attrs.initialtext){
                        scope.currentItemLabel = attrs.initialtext;
                         scope.setplaceholdercolor = true; //sets css class on first element. (placeholder)
                    }
                }else{
                    scope.setplaceholdercolor = false;
                    if(Array.isArray(scope.loadedItems)){
                        for(var i = 0; i < scope.loadedItems.length; i++){
                            if(angular.equals(newVal, getItemCode(scope.loadedItems[i])) ) {
                                scope.currentItemLabel = scope.getItemLabel(scope.loadedItems[i]);
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

                scope.ngModel = getItemCode(item);
                scope.currentItemLabel = scope.getItemLabel(item);
                scope.toggleCombo();
                ctrl.$setViewValue(scope.ngModel);
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
                if (scope.loadedItems !== undefined && attrs.initialtext !== ""){
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
            	if(scope.isOpen){
            		scope.element = element;
            		comboboxService.setActiveCombo(scope);
            	}else{
            		comboboxService.setActiveCombo(null);
            	}
            };
            
            function loadLineStyleItems() {
            	scope.loadedItems = [{'code': 'solid', 'text': '5,0'},{'code': 'dashed', 'text': "10,5"},{'code': 'dotted', 'text': "5,5"},{'code': 'dotdashed', 'text': "5,5,10,5"}];
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
            };
            
            init();
		}
	};
});
