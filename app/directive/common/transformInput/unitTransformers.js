var app = angular.module('unionvmsWeb');

app.constant('scaleFactors', {
    distance: {
        km: 1.852,
        mi: 1.15077944,
        nm: 1
    },
    speed: {
        kph: 1.852,
        mph: 1.1507794,
        kts: 1
    }
});

app.factory('distanceScaleFactor', ['globalSettingsService', 'scaleFactors', function(globalSettingsService, scaleFactors) {
    var unit = globalSettingsService.getDistanceUnit();
    return scaleFactors['distance'][unit];
}]);

app.factory('speedScaleFactor', ['globalSettingsService', 'scaleFactors', function(globalSettingsService, scaleFactors) {
    var unit = globalSettingsService.getSpeedUnit();
    return scaleFactors['speed'][unit];
}]);

app.directive('transformDistance', ['distanceScaleFactor', function(distanceScaleFactor) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            model.$parsers.push(function(newValue) {
            	return newValue / distanceScaleFactor;
            });

            model.$formatters.push(function(newValue) {
            	return newValue * distanceScaleFactor;
            });

        }
    };
}]);

app.directive('transformSpeed', ['speedScaleFactor', function(speedScaleFactor) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            model.$parsers.push(function(newValue) {
                return threeDecimals(newValue / speedScaleFactor);
            });

            model.$formatters.push(function(newValue) {
                return threeDecimals(newValue * speedScaleFactor);
            });

        }
    };
}]);

app.filter('distance', ['distanceScaleFactor', function(distanceScaleFactor) {
    return function(value) {
        return threeDecimals(value * distanceScaleFactor);
    };
}]);

app.filter('speed', ['speedScaleFactor', function(speedScaleFactor) {
    return function(value) {
        return threeDecimals(value * speedScaleFactor);
    };
}]);

function threeDecimals(value) {
    return Math.floor(value * 1000 + 0.5) / 1000;
}