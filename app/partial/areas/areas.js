angular.module('unionvmsWeb').controller('AreasCtrl',function($scope, $window, $interval, locale, genericMapService, areaMapService, projectionService, areaAlertService, areaHelperService, areaRestService, userService){
    //$scope.selectedTab = 'USERAREAS';
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
    
    $scope.isAllowed = function(module, feature){
        return userService.isAllowed(feature, module, true);
    };
    
    $scope.stopInitInterval = function(){
        $interval.cancel($scope.initInterval);
        $scope.initInterval = undefined;
        areaAlertService.removeLoading();
    };
    
    locale.ready('areas').then(function(){
        areaAlertService.setLoading(locale.getString('areas.inital_loading'));
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

    $scope.updateContainerSize = function(){
        setTimeout(function() {
//            if(evt && (angular.element('.mapPanelContainer.fullscreen').length > 0 ||
//                    (angular.element('.mapPanelContainer.fullscreen').length === 0 && evt.type.toUpperCase().indexOf("FULLSCREENCHANGE") !== -1))){
//                
//                
//                $('.map-container').css('height', w.height() + 'px');
//                $('#map').css('height', w.height() + 'px');
//                ms.updateMapSize();
//                return;
//            }
            
            var w = angular.element(window);
            var minHeight = 400;
            var headerHeight = angular.element('header')[0].offsetHeight;
            var newHeight = w.height() - headerHeight;
            
            if (newHeight < minHeight) {
                newHeight = minHeight;
            }
            
            $('.areaManagement').css('height', newHeight);
            $('#areaMap').css('height', newHeight + 'px');
            areaMapService.updateMapSize();
            
//            var areasPanel = $('.areas-panel').height();
//            var tabMenu = $('.tabMenu').height();
            
            //USERAREAS
            //div with table list of user areas
            //$('#user-areas-table .tbody').css('max-height', newHeight - $('.tabMenu').height() - 65 - 36 - 108); // .user-areas-table .thead'
            
            //User areas form
            //console.log($($('.base-area-container')[0]).height());
            //$('.area-form-container').css('height', $($('.base-area-container')[0]).height() - 40 - 50 - 45); //.editingTools and .user-area-btns and slider
            
//            angular.forEach($('.base-area-container'), function(item) {
//                console.log(item, areasPanel - tabMenu - 10);
//                $(item).css('height', areasPanel - tabMenu - 10);
//            });
//            
//            $('.areaCard').css('height', newHeight);
//            
//            
//            
//            //USERAREAS
//          
//            
//            //SYSAREAS
//            if ($('.sysareas-radio-btns').height() === 0){
//                var base = $($('.base-area-container')[0]).height();
//                $('.updateMetadata').css('height', base - (Math.abs(base - newHeight)) - 15);
//            } else {
//                $('.updateMetadata').css('height', newHeight - $('.tabMenu').height() - 65 - $('.sysareas-radio-btns').height());
//            }
//            
//            $('.metadata-container').css('height', $('#system-area-form-container').height() - 125);
//            $('.sysarea-wizard').css('max-height', $('#system-area-form-container').height() - 80);
//            
//            var datasetCont = $('.dataset-form-container').height();
//            if (datasetCont < 80){
//                datasetCont = 80;
//            }
//            
//            $('.dataset-table-container').css('max-height', newHeight - datasetCont - 240);
//            
//            //GENERIC CONTAINERS
//            //$('.area-loading').css('width', $('.areaCard').width());
//            $('.areaMap').css('height', newHeight);
            
        }, 100);
    };
    
    $($window).resize($scope.updateContainerSize);
    angular.element(document).ready(function () {
        $scope.updateContainerSize();
    });
});