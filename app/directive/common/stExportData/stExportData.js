angular.module('unionvmsWeb').directive('stExportData', function() {
    return {
        restrict: 'A',
        require: '^stTable',
        scope: {
            exportFn: '&',
            vmsType: '@'
        },
        link: function(scope, element, attrs, ctrl){
            element.bind('click', function(){
                var vmsData = ctrl.getFilteredCollection();
                if (vmsData.length > 0){
                    scope.exportFn({vmsType: attrs.vmsType, data: vmsData});
                }
            });
        }
    };
});