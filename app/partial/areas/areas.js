angular.module('unionvmsWeb').controller('AreasCtrl',function($scope, $window, $interval, locale, genericMapService, areaMapService, projectionService, areaAlertService, areaHelperService, areaRestService, userService, loadingStatus){
    $scope.expanded = true;
    $scope.alert = areaAlertService;
    $scope.helper = areaHelperService;
    $scope.graticuleActivated = false;
    $scope.graticuleTip = [locale.getString('areas.map_tip_enable'), locale.getString('areas.map_tip_graticule')].join(' ');
    
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
    
    $scope.switchCollapse = function(){
        $scope.expanded = !$scope.expanded;
    };
    
    $scope.isAllowed = function(module, feature){
        return userService.isAllowed(feature, module, true);
    };
    
    $scope.stopInitInterval = function(){
        $interval.cancel($scope.initInterval);
        $scope.initInterval = undefined;
        loadingStatus.isLoading('AreaManagement',false);
    };
    
    locale.ready('areas').then(function(){
        loadingStatus.isLoading('AreaManagement',true,0);
        genericMapService.setMapBasicConfigs();
        projectionService.getProjections();
        
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
        
        $scope.initInterval = $interval(function(){
            if (!_.isEqual(genericMapService.mapBasicConfigs, {})){
                areaMapService.setMap();
                areaHelperService.clearHelperService();
                if ($scope.selectedTab === 'USERAREAS'){
                    areaHelperService.lazyLoadUserAreas();
                }
                $scope.stopInitInterval();
            }
        }, 10);
    });
    
    //Map graticule
    $scope.toggleGraticule = function(){
        $scope.graticuleActivated = !$scope.graticuleActivated;
        areaMapService.setGraticule($scope.graticuleActivated);
        var firstTitle = locale.getString('areas.map_tip_enable');
        if ($scope.graticuleActivated){
            firstTitle = locale.getString('areas.map_tip_disable');
        }
        $scope.graticuleTip = [firstTitle, locale.getString('areas.map_tip_graticule')].join(' ');
    };
    
    $scope.getDisplayedLayerType = function(){
        var type;
        if ($scope.selectedTab === 'USERAREAS'){
            type = 'USERAREA';
        } else if ($scope.selectedTab === 'AREAGROUPS'){
            type = 'AREAGROUPS';
        } else {
            if (angular.isDefined($scope.helper.displayedSystemAreaLayer)){
                type = $scope.helper.displayedSystemAreaLayer;
            }
        }
        
        return type;
    };
    
    //Transparency Slider
    $scope.toggleSlider = function(){
        $scope.helper.slider.active = !$scope.helper.slider.active; 
        var layerType = $scope.getDisplayedLayerType();
        if ($scope.helper.slider.active && angular.isDefined(layerType)){
            $scope.helper.slider.transparency = areaMapService.getLayerOpacity($scope.helper.slider.layer);
        } else {
            $scope.helper.updateSlider(layerType);
            if (angular.isDefined(layerType)){
                areaMapService.setLayerOpacity(layerType, 1);
            }
        }
    };
    
    $scope.formatTooltip = function (value) {
        return value + '%';
    };
    
    $scope.setTransparency = function(value, event){
        if (angular.isDefined($scope.helper.slider.transparency)){
            areaMapService.setLayerOpacity($scope.helper.slider.layer, (100 - value) / 100);
        }
    };

    $scope.updateContainerSize = function(evt){
        setTimeout(function() {
            var w = angular.element(window);
            if(evt && (angular.element('#areaManagement.fullscreen').length > 0 ||
                    (angular.element('#areaManagement.fullscreen').length === 0 && evt.type.toUpperCase().indexOf("FULLSCREENCHANGE") !== -1))){
                
                
                $('#areaManagement').css('height', w.height() + 'px');
                $('#areaMap').css('height', w.height() + 'px');
                areaMapService.updateMapSize();
                return;
            }
            
            var minHeight = 400;
            var headerHeight = angular.element('header')[0].offsetHeight;
            var newHeight = w.height() - headerHeight;
            
            if (newHeight < minHeight) {
                newHeight = minHeight;
            }
            
            $('#areaManagement').css('height', newHeight + 'px');
            $('#areaMap').css('height', newHeight + 'px');
            areaMapService.updateMapSize();
        }, 100);
    };
    
    $($window).resize($scope.updateContainerSize);
    angular.element(document).ready(function () {
        $scope.updateContainerSize();
    });
});