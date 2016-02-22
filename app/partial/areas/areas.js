angular.module('unionvmsWeb').controller('AreasCtrl',function($scope, locale, areaMapService, areaAlertService){
    $scope.selectedTab = 'USERAREAS';
    $scope.alert = areaAlertService;
    
    var setTabs = function(){
        return [{
            'tabId': 'USERAREAS',
            'title': locale.getString('areas.my_areas')
        },{
            'tabId': 'SYSAREAS',
            'title': locale.getString('areas.sys_areas')
        },{
            'tabId': 'AREAGROUPS',
            'title': locale.getString('areas.area_groups')
        }];
    };
    
    $scope.selectTab = function(tabId){
        $scope.selectedTab = tabId;
    };
    
    locale.ready('areas').then(function(){
        $scope.tabs = setTabs();
        areaMapService.setMap();
        $scope.map = areaMapService.map;
    });
    
    $scope.updateContainerSize = function(){
        var w = angular.element(window);
        setTimeout(function() {
            var offset = 50;
            var minHeight = 340;
            var footerHeight = angular.element('footer')[0].offsetHeight;
            var headerHeight = angular.element('header')[0].offsetHeight;
            var newHeight = w.height() - headerHeight - footerHeight - offset;
            
            if (newHeight < minHeight) {
                newHeight = minHeight;
            }
            
            $('.areaCard').css('height', newHeight);
            
            angular.forEach($('.base-area-container'), function(item) {
            	$(item).css('height', newHeight - $('.tabMenu').height() - 30);
            });
            
            //div with table list of user areas
            $('.user-areas-table .tbody').css('max-height', newHeight - $('.tabMenu').height() - 65 - 36 - 108); // .user-areas-table .thead'
            
            //User areas form
            $('.area-form-container').css('height', $($('.base-area-container')[0]).height() - 40 - 50 - 45); //.editingTools and .user-area-btns and slider
            
            $('.area-loading').css('width', $('.areaCard').width());
            $('.areaMap').css('height', newHeight);
            areaMapService.updateMapSize();
        }, 100);
    };
    
    $(window).resize($scope.updateContainerSize);
    angular.element(document).ready(function () {
        $scope.updateContainerSize();
    });
});