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
            $('.base-area-container').css('height', newHeight - $('.tabMenu').height() - 30);
            $('.area-form-container').css('height', newHeight - $('.tabMenu').height() -$('.area-radio-group').height() - $('.editingTools').height() - $('.user-area-btns').height() - 100);
            
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