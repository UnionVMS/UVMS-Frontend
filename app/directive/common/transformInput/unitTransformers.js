/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
(function() {
    'use strict';

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
        },
        length: {
            ft: 3.2808399,
            m: 1
        }
    });

    app.service('unitScaleFactors', ['globalSettingsService', 'scaleFactors', function(globalSettingsService, scaleFactors) {
        return {
            getSpeedScaleFactor: getScaleFactor('speed'),
            getDistanceScaleFactor: getScaleFactor('distance'),
            getLengthScaleFactor: getScaleFactor('length')
        };

        function getScaleFactor(type) {
            return function() {
                return scaleFactors[type][getUnit(type)];
            };
        }

        function getUnit(type) {
            if (type === 'speed') {
                return globalSettingsService.getSpeedUnit();
            }
            else if (type === 'distance') {
                return globalSettingsService.getDistanceUnit();
            }
            else if (type === 'length') {
                return globalSettingsService.getLengthUnit();
            }
        }
    }]);

    app.directive('transformDistance', ['unitScaleFactors', function(unitScaleFactors) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, model) {
                model.$parsers.push(function(newValue) {
                    return newValue / unitScaleFactors.getDistanceScaleFactor();
                });

                model.$formatters.push(function(newValue) {
                    return threeDecimals(newValue * unitScaleFactors.getDistanceScaleFactor());
                });
            }
        };
    }]);

    app.directive('transformSpeed', ['unitScaleFactors', function(unitScaleFactors) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, model) {
                model.$parsers.push(function(newValue) {
                    return newValue / unitScaleFactors.getSpeedScaleFactor();
                });

                model.$formatters.push(function(newValue) {
                    return threeDecimals(newValue * unitScaleFactors.getSpeedScaleFactor());
                });
            }
        };
    }]);

    app.directive('transformLength', ['unitScaleFactors', function(unitScaleFactors) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, model) {
                model.$parsers.push(function(newValue) {
                    return newValue / unitScaleFactors.getLengthScaleFactor();
                });

                model.$formatters.push(function(newValue) {
                    return threeDecimals(newValue * unitScaleFactors.getLengthScaleFactor());
                });
            }
        };
    }]);

    app.filter('distance', ['unitScaleFactors', function(unitScaleFactors) {
        return function(value) {
            return threeDecimals(value * unitScaleFactors.getDistanceScaleFactor());
        };
    }]);

    app.filter('speed', ['unitScaleFactors', function(unitScaleFactors) {
        return function(value) {
            return threeDecimals(value * unitScaleFactors.getSpeedScaleFactor());
        };
    }]);

    app.filter('length', ['unitScaleFactors', function(unitScaleFactors) {
        return function(value) {
            return threeDecimals(value * unitScaleFactors.getDistanceScaleFactor());
        };
    }]);

    app.service('unitTransformer', ['unitScaleFactors', function(unitScaleFactors) {
        return {
            length: {
                toLengthUnitRangeString: toLengthUnitRangeString
            }
        };

        function toLengthUnitRangeString(range) {
            var lengthScaleFactor = unitScaleFactors.getLengthScaleFactor();
            return range.replace(/,/g, '.').split('-').map(function(length) {
                var suffix = '';
                if (length.match(/\+$/)) {
                    suffix = '+';
                    length = length.substring(0, length.length - 1);
                }

                return threeDecimals(length * lengthScaleFactor) + suffix;
            }).join("-").replace(/\./g, ",");
        }
    }]);

    function threeDecimals(value) {
        // Truncate to three decimal places by rounding appropriately.
        return Math.floor(value * 1000 + 0.5) / 1000;
    }
})();