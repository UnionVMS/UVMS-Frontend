angular.module('unionvmsWeb').directive('combobox', function(comboboxService) {
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
            multiple : '=',
            uppercase : '=',
            initialtext : '@',
            isLoading : '=',
            group: '@',
            name: '@',
            comboSection: '=',
            initCallback: '=',
            noPlaceholderOnList: '@'
		},
        templateUrl: 'directive/common/combobox/combobox.html',
		link: function(scope, element, attrs, ctrl) {
			scope.comboboxServ = comboboxService;
			scope.element = element;
			scope.initialitem = true;
			
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
            
            if(scope.multiple){
        		scope.selectedItems = [];
        	}
            
            if(scope.group){
                scope.comboboxServ.initializeGroup(scope.group,scope);
            }
            
            //Get the label for an item
            scope.getItemLabel = function(item){
                return item.text;
            };

            //Get the code (id) for an item
            var getItemCode = function(item){
                return item.code;
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
                if ((scope.ngModel === undefined || scope.ngModel === "" || scope.ngModel === null || (_.isArray(scope.ngModel) && scope.ngModel.length === 0)) && scope.initialtext) {
                    scope.currentItemLabel = scope.initialtext;
                }
                
                if(!scope.multiple){
	                if(scope.loadedItems !== undefined){
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
                }
            };

            //Watch for changes to the ngModel and update the dropdown label
            scope.$watch(function () { return scope.ngModel;}, function (newVal, oldVal) {
                if(angular.isDefined(scope.group)){
                    scope.comboboxServ.updateComboListGroup(scope.group, newVal, oldVal);
                }
                
            	if(scope.multiple){
            		scope.selectedItems = [];
            		scope.currentItemLabel = undefined;
            	}
            	
                if(newVal === null || newVal === undefined || newVal === "" || (_.isArray(newVal) && newVal.length === 0)){
                    if(scope.initialtext){
                        scope.currentItemLabel = scope.initialtext;
                        scope.setplaceholdercolor = true; //sets css class on first element. (placeholder)
                    }
                    if(scope.editable){
                    	scope.newItem = {};
                    }
                }else{
                    scope.setplaceholdercolor = false;
                    if(Array.isArray(scope.loadedItems)){
                        
                    	if(scope.multiple){
                    		for(var i = 0; i < newVal.length; i++){
                    			for(var j = 0; j < scope.loadedItems.length; j++){
	                        		if(angular.equals(newVal[i], getItemCode(scope.loadedItems[j]))) {
	                        			scope.selectedItems.push(scope.loadedItems[j]);
		                                break;
		                            }
                    			}
                    		}
                            scope.currentItemLabel = "";
                    	}else{
                            var comboItems = scope.loadedItems;
                            if(scope.comboSection){
                                comboItems = scope.loadedItems[0].items;
                            }
                    		for(var k = 0; k < comboItems.length; k++){
                    			if(scope.editable){
                    				if(scope.comboForm.comboEditableInput.$dirty){
                						scope.isFilterActive = true;
                    				}
                    				if(angular.equals(newVal, scope.getItemLabel(comboItems[k]))) {
		                        		scope.newItem.text = scope.getItemLabel(comboItems[k]);
		                                break;
		                            }
                    			}else{
                    				if(angular.equals(newVal, getItemCode(comboItems[k]))) {
		                        		scope.currentItemLabel = scope.getItemLabel(comboItems[k]);
		                                break;
		                            }
                    			}
                        	}
                    	}
                    }
                }
            });
            
            scope.$watchCollection('items', function(newVal, oldVal){
            	scope.isFilterActive = false;
                if (newVal && newVal.length > 0){
                	scope.loadedItems = newVal;
                	
                	if(scope.uppercase){
                		for(var i=0;i<scope.loadedItems.length;i++){
                			scope.loadedItems[i].text = scope.loadedItems[i].text.toUpperCase();
                		}
    				}
                	
                	if(scope.multiple){
                		scope.selectedItems = [];
                		if(angular.isDefined(scope.ngModel)){
	                		angular.forEach(scope.ngModel, function(item) {
	                			for(var i=0;i<scope.loadedItems.length;i++){
		                			if(scope.loadedItems[i].code === item){
		                				scope.selectedItems.push(scope.loadedItems[i]);
		                			}
	                			}
	                		});
                		}
                	}else if(angular.isDefined(scope.ngModel)){                   
                        var item = getItemObjectByCode(scope.ngModel);
                        if (angular.isDefined(item)){
                            scope.currentItemLabel = scope.getItemLabel(item);
                        }
                	}
                }
            },true);

            scope.$watch('initialtext',function(newVal,oldVal){
                if(!angular.isDefined(scope.ngModel)){
                    scope.currentItemLabel = newVal;
                }
            });
            
            //Select item in dropdown
            scope.selectVal = function(item){
                //Disabled item
                if(scope.disabledItem(item)){
                    return;
                }

                if(scope.multiple){
                	if(scope.ngModel.indexOf(item.code) === -1){
                		var arr = [].concat(scope.ngModel);
                		arr.push(getItemCode(item));
                		scope.ngModel = arr;
                	}
                }else if(scope.editable){
                	if(angular.isDefined(item.code)){
                		scope.newItem.text = item.text;
                	}else{
                		scope.newItem.text = '';
                	}
                	scope.ngModel = scope.newItem.text;
                	ctrl.$setViewValue(scope.ngModel);
            	}else{
	                scope.ngModel = getItemCode(item);
	                scope.currentItemLabel = scope.getItemLabel(item);
	                ctrl.$setViewValue(scope.ngModel);
            	}
                
                scope.toggleCombo();
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
            	if(scope.multiple && evt && evt.target && evt.target.className.indexOf('item-remover') !== -1){
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
            
            scope.removeSelectedItem = function(code){
                closeCombo();
            	scope.ngModel.splice(scope.ngModel.indexOf(code),1);
            	var arr = [];
            	angular.copy(scope.ngModel,arr);
            	scope.ngModel = arr; 
            };
            
            scope.removeAllSelected = function(){
                closeCombo();
            	scope.ngModel = [];
            };
            
            scope.onComboChange = function(){
            	if(scope.focus){
	            	scope.isOpen = true;
	        		comboboxService.setActiveCombo(scope);
            	}
        		scope.newItem.text = scope.newItem.text.toUpperCase();
            	scope.ngModel = scope.newItem.text;
            	ctrl.$setViewValue(scope.ngModel);
            };
            
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
