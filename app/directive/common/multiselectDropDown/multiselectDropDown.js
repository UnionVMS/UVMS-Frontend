angular.module('unionvmsWeb').directive('multiselectDropDown', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			model: '=',
			options: '=',
			pre_selected: '=preSelected',
			checkall: '=',
			uncheckall: '=',
			checkallenable: '=',
			initialtext: "@"
		},
		templateUrl: 'directive/common/multiselectDropDown/multiselectDropDown.html',
		link: function(scope, element, attrs, fn) {
			scope.selection = scope.initialtext || "Text missing";
			console.log("model");
			console.log(scope.model);
			console.log("initialtext");
			console.log(scope.initialtext);
			
			scope.openDropdown = function(){        
					scope.selected_items = [];
					for(var i=0; i<scope.pre_selected.length; i++){                        
						scope.selected_items.push(scope.pre_selected[i].text);
					}                                     
			};

			scope.selectAll = function () {
				scope.model = _.pluck(scope.options, 'code');
				console.log(scope.model);
			};            
			
			scope.deselectAll = function() {
				scope.model=[];
				console.log(scope.model);
			};
			
			scope.setSelectedItem = function(){
				var code = this.option.code;
				if (_.contains(scope.model, code)) {
					scope.model = _.without(scope.model, code);
				} else {
					scope.model.push(code);
				}
				console.log(scope.model);
				return false;
			};
		   
			scope.isChecked = function (code) {                 
				if (_.contains(scope.model, code)) {
					return 'icon-ok pull-right';
				}
				return false;
			};
		}
	};
});

