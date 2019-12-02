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
(function() {
    'use strict';

    var app = angular.module('unionvmsWeb');

    app.controller('infoModalCtrl', function($scope, $modalInstance, options, locale) {

        $scope.loading = false;
        $scope.labels = {
            title: options.titleLabel || '',
            text: options.textLabel || '',
            close: options.closeLabel || locale.getString("common.close"),
        };

        //Is there a promise that needs to be resolved before we have the text to show?
        if(angular.isDefined(options.textLabelPromise)){
            $scope.loading = true;
            options.textLabelPromise.then(
                function(textLabel){
                    $scope.loading = false;
                    $scope.labels.text = textLabel;
                },
                function(errorTextLabel){
                    $scope.loading = false;
                    $scope.labels.text = errorTextLabel;
                }
            );
        }

        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
    });

    app.factory('infoModal',function($modal){
        return {
            open :function(options){
                return $modal.open({
                    templateUrl: 'partial/common/infoModal/infoModal.html',
                    controller: 'infoModalCtrl',
                    windowClass : "infoModal",
                    size: "small",
                    resolve: {
                        options: function() {
                            return options || {};
                        },
                    }
                });
            }
        };

    });
})();