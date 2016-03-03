angular.module('unionvmsWeb').controller('AreasCtrl',function($scope, $window, locale, areaMapService, areaAlertService, areaHelperService,areaRestService){
    $scope.selectedTab = 'USERAREAS';
    $scope.alert = areaAlertService;
    $scope.helper = areaHelperService;
    
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
        if (tabId !== $scope.selectedTab){
            $scope.helper.tabChange(tabId);
            $scope.selectedTab = tabId;
        }
    };
    
    locale.ready('areas').then(function(){
        $scope.tabs = setTabs();
        areaMapService.setMap();
        areaHelperService.clearHelperService();
        $scope.getUserAreasGroupsList();
    });

    //USER AREAS GROUPS LIST
    $scope.getUserAreasGroupsList = function(){
        areaRestService.getUserAreaTypes().then(function(response){
        	if (angular.isDefined(response)) {
        		var areaGroups = [];
        		for(var i=0;i<response.length;i++){
        			areaGroups.push({code: i,text: response[i]});
        		}
        		$scope.userAreasGroups = areaGroups;
        	}
        }, function(error){
            $scope.alert.setError();
            $scope.alert.alertMessage = locale.getString('areas.error_getting_userarea_types');
            $scope.alert.hideAlert();
        });
    };
    
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
            
            
            if ($scope.selectedTab === 'USERAREAS'){
                
            }
            //div with table list of user areas
            $('#user-areas-table .tbody').css('max-height', newHeight - $('.tabMenu').height() - 65 - 36 - 108); // .user-areas-table .thead'
            
            //User areas form
            $('.area-form-container').css('height', $($('.base-area-container')[0]).height() - 40 - 50 - 45); //.editingTools and .user-area-btns and slider
            
            $('.area-loading').css('width', $('.areaCard').width());
            $('.areaMap').css('height', newHeight);
            
            //Update
            
            areaMapService.updateMapSize();
        }, 100);
    };
    
    $($window).resize($scope.updateContainerSize);
    angular.element(document).ready(function () {
        $scope.updateContainerSize();
    });
});