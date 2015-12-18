angular.module('unionvmsWeb').factory('formService',function() {

	var formService = {};
	
	//set all fields on form and subforms in dirty state
	formService.setAllDirty = function(formNames, scope){
		var formChildren = angular.element('ng-form', angular.element('[name=' + _.last(formNames) + ']'));
		if(formChildren.length > 0){
			angular.forEach(formChildren, function(item) {
				var subFormNames = [];
				angular.copy(formNames, subFormNames);
				subFormNames.push(item.attributes.name.nodeValue);
				formService.setAllDirty(subFormNames, scope);
			});
		}else{
			var formControls = angular.element('[name]', angular.element('[name=' + _.last(formNames) + ']'));
			angular.forEach(formControls, function(item){
				var elem = scope[formNames[0]];
				for(var i=1;i<formNames.length;i++){
					elem = elem[formNames[i]];
					if(!elem){
						return;
					}
				}
				elem = elem[item.attributes.name.nodeValue];
				elem.$setDirty();
			});
		}
	};

	return formService;
});