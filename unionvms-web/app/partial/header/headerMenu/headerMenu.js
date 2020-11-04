/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('HeaderMenuCtrl',function($scope, $rootScope, $location, $state, $timeout, $log, userService, userFeatureAccess, startPageService, locale, $window, envConfig, ENV_NAME){

    $scope.menuSpecs = {
        width: 0,
        wrapperWidth: 0,
        items: [],
        step: 0,
        scrolls: {
            left: false,
            right: false
        }
    };

    var checkAccess = function(module, feature) {
        return userService.isAllowed(feature, module, true);
    };

    $scope.addMenuItem = function(text, url, elemId) {
        var obj = {
            'title': text,
            'url': url,
            'elemId': elemId
        }
        /* Subscriptions tab is a link to the new app,
        * If we are in development environment we need to send token and sessionId with redirection url as
        * local storage is available per domain
        */
        if (text === 'Subscriptions' && ENV_NAME === 'development') {
            var token =  JSON.parse(localStorage.getItem('ngStorage-token'));
            var sessionId =  JSON.parse(localStorage.getItem('ngStorage-sessionId'));
            var roleName = JSON.parse(localStorage.getItem('ngStorage-roleName'));
            var scopeName = JSON.parse(localStorage.getItem('ngStorage-scopeName'));
            obj.href = envConfig.new_app_url + '/subscriptions?token=' + token + '&sessionId=' + sessionId + '&scopeName=' + scopeName + '&roleName=' + roleName;
        } else if (text === 'Subscriptions') {
            obj.href = envConfig.new_app_url + '/subscriptions';
        }
        $scope.menu.push(obj);
    };

    $scope.setMenu = function() {

        $scope.menu = [];

        // Today
        $scope.addMenuItem(locale.getString('header.menu_today'), '/today', 'today');

        // Reports
        if (checkAccess('Reporting', 'LIST_REPORTS')) {
            $scope.addMenuItem(locale.getString('header.menu_reporting'), '/reporting', 'reporting');
        }

        // Area management
        if (checkAccess('Spatial', 'VIEW_AREA_MANAGEMENT_UI') && (checkAccess('Spatial', 'MANAGE_USER_DEFINED_AREAS') || checkAccess('Spatial', 'MANAGE_REFERENCE_DATA') || checkAccess('Spatial', 'MANAGE_ANY_USER_AREA'))) {
            $scope.addMenuItem(locale.getString('header.menu_areas'), '/areas', 'areas');
        }

        // Subscriptions
        if (checkAccess('Subscription','VIEW_SUBSCRIPTION') && checkAccess('USM', 'viewOrganisations')) {
            $scope.addMenuItem(locale.getString('header.menu_subscriptions'), '/subscriptions/manageSubscriptions', 'manageSubscriptions');
        }

        // Activity
        if (checkAccess('Activity', 'ACTIVITY_ALLOWED')) {
            $scope.addMenuItem(locale.getString('header.menu_activity'), '/activity', 'activity');
        }

        // Positions
        var movementLink = false;
        var movementElemId;

        if (checkAccess('Movement', 'viewMovements')) {
            movementLink = '/movement';
            movementElemId = 'movement';
        } else if (checkAccess('Movement', 'viewManualMovements')) {
            movementLink = '/movement/manual';
            movementElemId = 'manual-movement';
        }

        if (movementLink) {
            $scope.addMenuItem(locale.getString('header.menu_movement'), movementLink, movementElemId);
        }

        //Sales
        if (checkAccess('Sales', 'viewSalesReports')) {
            $scope.addMenuItem(locale.getString('header.menu_sales'), '/sales', 'sales');
        }

        // Exchange
        if (checkAccess('Exchange', 'viewExchange')) {
            $scope.addMenuItem(locale.getString('header.menu_exchange'), '/exchange', 'exchange');
        }

        // Assets
        if (checkAccess('Union-VMS', 'viewVesselsAndMobileTerminals')) {
            $scope.addMenuItem(locale.getString('header.menu_assets'), '/assets', 'assets');
        }

        // Alerts
        var alarmsLink = false;
        var alarmsElemId;

        if (checkAccess('Rules', 'viewAlarmsHoldingTable')) {
            alarmsLink = '/alerts/holdingtable';
            alarmsElemId = 'holding-table';
        } else if (checkAccess('Rules', 'viewAlarmsOpenTickets')) {
            alarmsLink = '/alerts/notifications';
            alarmsElemId = 'alarms-notifications';
        } else if (checkAccess('Rules', 'viewAlarmRules')) {
            alarmsLink = '/alerts/rules';
            alarmsElemId = 'alarms-rules';
        }

        if (alarmsLink) {
            $scope.addMenuItem(locale.getString('header.menu_alarmconditions'), alarmsLink, alarmsElemId);
        }

        // User
        if (userFeatureAccess.accessToAnyFeatureInList('USM')) {
            $scope.addMenuItem(locale.getString('header.menu_user'), '/usm/users', 'users');
        }

        // Admin
        var adminLink = false;
        var adminElemId;

        if (checkAccess('Audit', 'viewAudit')) {
            adminLink = '/admin/auditlog';
            adminElemId = 'audit-log';
        } else if (checkAccess('Configuration', 'viewConfiguration')) {
            adminLink = '/admin/configuration';
            adminElemId = 'admin-configuration';
        }

        if (adminLink) {
            $scope.addMenuItem(locale.getString('header.menu_admin'), adminLink, adminElemId);
        }
    };

    var getFirstPathSegment = function(path) {
        if (!path) {
            return "";
        }

        var absolutePath = path.substr(0,1) === "/";
        var pathComponents = (absolutePath ? path.substr(1, path.length - 1) : path).split("/");
        return absolutePath ? "/" + pathComponents[0] : pathComponents[0];
    };

    $scope.isActive = function(viewLocation){
        return getFirstPathSegment($location.path()) === (getFirstPathSegment(viewLocation));
    };

    $scope.goToPage = function(url, href) {
        // if href exists then menu tab is a link to the new app
        if (href) {
            window.location.href = href
        } else {
            $location.path(url);
        }
    };

    /**
     * Calculate the width of the entire menu and wrapper
     *
     * @private
     */
    function calculateItemListWidth (){
        var menuItems = angular.element('.menu-item');
        var totalWidth = 0;
        angular.forEach(menuItems, function (item) {
            totalWidth += item.clientWidth;
            $scope.menuSpecs.items.push({title: item.innerText, width: item.clientWidth});
        });

        $scope.menuSpecs.width = totalWidth;
        $scope.menuSpecs.wrapperWidth = angular.element('.menu-wrapper')[0].clientWidth;
    }

    /**
     * Set the scroll visibility
     *
     * @private
     * @param {Object} scrollObj - an object containing the visibility of the scrolls ({'left': true, 'right': false}
     */
    function setScrollVisibility(scrollObj){
        var keys = Object.keys(scrollObj);

        angular.forEach(keys, function (key) {
            $scope.menuSpecs.scrolls[key] = scrollObj[key];
        });
    }

    /**
     * Recalculate the menu specs for scrolling
     *
     * @private
     */
    function recalculateScrolls() {
        calculateItemListWidth();
        var rightVisible = false;
        if ($scope.menuSpecs.width > $scope.menuSpecs.wrapperWidth){
            rightVisible = true;
        }
        setScrollVisibility({'right': rightVisible, 'left': false});
        $scope.menuSpecs.step = 0;
        angular.element('.menu-wrapper')[0].scrollLeft = 0;
    }

    /**
     * Calculate scrolling width and divid it in steps if needed
     *
     * @private
     * @param {String} direction - left or right
     * @returns {number} - the width in pixels for scrolling
     */
    function calculateScrollWidth(direction){
        $scope.menuSpecs.wrapperWidth = angular.element('.menu-wrapper')[0].clientWidth;
        var steps = Math.ceil($scope.menuSpecs.width / $scope.menuSpecs.wrapperWidth);
        var stepWidth =  Math.floor($scope.menuSpecs.width / steps);

        var inItemsWidth = 0;
        var outItemsWidth = 0;
        angular.forEach($scope.menuSpecs.items, function (item) {
            if (inItemsWidth<= $scope.menuSpecs.wrapperWidth){
                inItemsWidth += item.width;
            } else {
                outItemsWidth += item.width;
            }
        });

        var width = Math.abs($scope.menuSpecs.wrapperWidth - $scope.menuSpecs.width);
        setScrollVisibility({'right': false, 'left': true});
        if (steps > 2){
            if (direction === 'right'){
                $scope.menuSpecs.step += 1;
            } else {
                $scope.menuSpecs.step -= 1;
            }
            var invertedStep = Math.abs(($scope.menuSpecs.step + 1) - steps);
            if (invertedStep + 1 === steps){
                width = 0;
            } else {
                width = Math.abs(width - (stepWidth * invertedStep));
            }

            if ($scope.menuSpecs.step +1 === steps){
                setScrollVisibility({'right': false, 'left': true});
            } else {
                setScrollVisibility({'right': true, 'left': true});
            }
        } else if (steps <= 2 && direction === 'left'){
            width = 0;
        }

        if (width === 0){
            setScrollVisibility({'right': true, 'left': false});
        }

        return width;
    }

    /**
     * Animation function
     *
     * @private
     * @param t - current time
     * @param b - start value
     * @param c - change in value
     * @param d - duration
     * @returns {Number}
     */
    function easeInOutQuad (t, b, c, d) {
        t /= d/2;
        if (t < 1) {
            return c/2*t*t + b;
        }
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    }

    /**
     * Scroll menu with animation
     *
     * @private
     * @param element - HTML element that shoudl be scrolled
     * @param {Number} to - pixels to be scrolled
     * @param {Number} duration - miliseconds for the duration of the animation
     */
    function sideScroll(element, to, duration){
        var start = element.scrollLeft;
        var change = to - start;
        var currentTime = 0;
        var increment = 20;

        var animateScroll = function(){
            currentTime += increment;
            var val = easeInOutQuad(currentTime, start, change, duration);
            element.scrollLeft = val;
            if(currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
    }

    /**
     * Check if scroll is visible
     *
     * @public
     * @param {String} direction - left or right
     */
    $scope.isScrollVisible = function(direction){
        return $scope.menuSpecs.scrolls[direction];
    };

    /**
     * Scroll menu to the right
     *
     * @public
     */
    $scope.scrollRight = function(){
        sideScroll(angular.element('.menu-wrapper')[0], calculateScrollWidth('right'), 200);
    };

    /**
     * Scroll menu to the left
     *
     * @public
     */
    $scope.scrollLeft = function(){
        sideScroll(angular.element('.menu-wrapper')[0],  calculateScrollWidth('left'), 200);
    };

    $rootScope.$on('AuthenticationSuccess', function () {
        $scope.setMenu();
    });

    $rootScope.$on('needsAuthentication', function () {
        $scope.setMenu();
    });

    $rootScope.$on('ContextSwitch', function () {
        $scope.setMenu();
        var homeState = startPageService.getStartPageStateName();

        if ($state.current.name === homeState) {
        	//This timeout is required when the homeState is the same as the current tab
        	$timeout(function() {
        		$state.go(homeState, {});
    		}, 1);
        } else {
        	$state.go(homeState, {});
        }

    });

    $scope.setMenu();

    //Initial scroll setup
    $timeout(function(){
        calculateItemListWidth();
        if ($scope.menuSpecs.width > $scope.menuSpecs.wrapperWidth){
            setScrollVisibility({'right': true});
        }
    });

    //Adjust scrolls on window resize
    $($window).resize(function(){
        recalculateScrolls();
    });
});
