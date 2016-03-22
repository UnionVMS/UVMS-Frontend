angular.module('unionvmsWeb').controller('AreasCtrl',function($scope, $window, locale, areaMapService, areaAlertService, areaHelperService, areaRestService, userService){
    $scope.selectedTab = undefined;
    $scope.alert = areaAlertService;
    $scope.helper = areaHelperService;
    
    var setTabs = function(){
        var context = userService.getCurrentContext();
        
        var tabs = [];
        angular.forEach(context.role.features, function(obj) {
            if (obj.applicationName === 'Spatial'){
                if (obj.featureName === 'MANAGE_USER_DEFINED_AREAS'){
                    this.splice(0, 0, {
                        'tabId': 'USERAREAS',
                        'title': locale.getString('areas.my_areas')
                    });                    
                    
                    this.splice(1, 0, {
                        'tabId': 'AREAGROUPS',
                        'title': locale.getString('areas.area_groups')
                    });
                } else if (obj.featureName === 'MANAGE_REFERENCE_DATA'){
                    this.push({
                        'tabId': 'SYSAREAS',
                        'title': locale.getString('areas.sys_areas')
                    });
                }
            }
        }, tabs);
        
        return tabs;
    };
    
    $scope.selectTab = function(tabId){
        if (tabId !== $scope.selectedTab){
            $scope.helper.tabChange(tabId);
            $scope.selectedTab = tabId;
        }
    };
    
    locale.ready('areas').then(function(){
        $scope.tabs = setTabs();
        if (!angular.isDefined($scope.selectedTab)){
            var userAreas = _.findWhere($scope.tabs, {tabId: 'USERAREAS'});
            var sysAreas = _.findWhere($scope.tabs, {tabId: 'SYSAREAS'});
            
            if (angular.isDefined(userAreas)){
                $scope.selectedTab = 'USERAREAS';
            } else if (angular.isDefined(sysAreas)){
                $scope.selectedTab = 'SYSAREAS';
            }
        }
        areaMapService.setMap();
        areaHelperService.clearHelperService();
    });

    $scope.updateContainerSize = function(){
        setTimeout(function() {
            var w = angular.element(window);
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
            
            
            //USERAREAS
            //div with table list of user areas
            $('#user-areas-table .tbody').css('max-height', newHeight - $('.tabMenu').height() - 65 - 36 - 108); // .user-areas-table .thead'
            
            //User areas form
            $('.area-form-container').css('height', $($('.base-area-container')[0]).height() - 40 - 50 - 45); //.editingTools and .user-area-btns and slider
            
            //SYSAREAS
            if ($('.sysareas-radio-btns').height() === 0){
                var base = $($('.base-area-container')[0]).height();
                $('.updateMetadata').css('height', base - (Math.abs(base - newHeight)) - 15);
            } else {
                $('.updateMetadata').css('height', newHeight - $('.tabMenu').height() - 65 - $('.sysareas-radio-btns').height());
            }
            
            $('.metadata-container').css('height', $('.updateMetadata').height() - 45);
            
            //GENERIC CONTAINERS
            $('.area-loading').css('width', $('.areaCard').width());
            $('.areaMap').css('height', newHeight);
            areaMapService.updateMapSize();
        }, 100);
    };
    
    $($window).resize($scope.updateContainerSize);
    angular.element(document).ready(function () {
        $scope.updateContainerSize();
    });
});