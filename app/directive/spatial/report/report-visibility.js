angular.module('unionvmsWeb').directive('reportVisibility', function(locale) {
	return {
		restrict: 'E',
		replace: true,
		scope: {},
		template: '<span class="label label-{{labelType}} label-visibility">{{labelText}}</span>',
    	link: function( scope, elem,attrs ){      

			scope.labelText = locale.getString('spatial.reports_table_share_label_' + attrs.visibility);

			if (attrs.visibility === 'private') {
				//attrs.$set('class', 'new value');
				scope.labelType = 'default';			
			} else if (attrs.visibility === 'scope') {
				scope.labelType = 'warning';			
			} else if (attrs.visibility === 'public') { //else it is public
				scope.labelType = 'success';			
			}

	    }    	

	};
});