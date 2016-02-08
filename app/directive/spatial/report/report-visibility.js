angular.module('unionvmsWeb').directive('reportVisibility', function(locale) {
	return {
		restrict: 'E',
		replace: true,
        scope: {
            reportVisibility: '=ngModel',
            visibility: '='
        },
		template: '<span class="label label-{{labelType}} label-visibility">{{labelText}}</span>',
    	link: function( scope, elem,attrs ){    

			if (angular.isDefined(scope.reportVisibility)) {
				//console.log("ngModel is used");
				//Watch for changes to the ngModel and update the visibility label
	            scope.$watch(function () { return scope.reportVisibility;}, function (newVal) {
	            	//console.log("watch is triggered");
	                if(angular.isDefined(newVal)){
	                    init();
	                }
	            }, true);
			}
            
            var init = function(){
            	//console.log("init() is triggered");
               	var visibilityParam;

	    		if (angular.isDefined(scope.reportVisibility)) {
	    			visibilityParam = scope.reportVisibility.toLowerCase();
	    		} else if (angular.isDefined(scope.visibility)) {
	    			visibilityParam = scope.visibility.toLowerCase();
	    		} else if (angular.isDefined(attrs.visibility)){
	    			visibilityParam = attrs.visibility.toLowerCase();
	    		} else {
	    			//console.log(scope);
	    		}

	    		//console.log('spatial.reports_table_share_label_' + visibilityParam);

				scope.labelText = locale.getString('spatial.reports_table_share_label_' + visibilityParam);

				//console.log(scope.labelText);
				//console.log(">>>" + visibilityParam);

				if (visibilityParam === 'private') {
					scope.labelType = 'default';			
				} else if (visibilityParam === 'scope') {
					scope.labelType = 'warning';			
				} else if (visibilityParam === 'public') { //else it is public
					scope.labelType = 'success';			
				}
            };
            
            init();
	    }    	

	};
});