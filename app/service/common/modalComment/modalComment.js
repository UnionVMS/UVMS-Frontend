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

    app.controller('modalCommentCtrl', function($scope, $uibModalInstance, options, locale) {
        $scope.submitAttempted = false;
        $scope.comment = "";
        $scope.labels = {
            title: options.titleLabel || locale.getString("common.comment"),
            save: options.saveLabel || locale.getString("common.save"),
            cancel: options.cancelLabel || locale.getString("common.cancel"),
            placeholder: options.placeholderLabel || locale.getString("common.comment_modal_comment_placeholder")
        };

        $scope.save = function() {
            $scope.submitAttempted = true;
            if($scope.commentForm.$valid) {
                $uibModalInstance.close($scope.comment);
            }
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss();
        };
    });

    app.factory('modalComment', function($uibModal) {
        return {
            open: function(callback, options) {
                $uibModal.open({
                    templateUrl: "service/common/modalComment/modalComment.html",
                    controller: "modalCommentCtrl",
                    backdrop: 'static', //will not close when clicking outside the modal window
                    resolve: {
                        options: function() {
                            return options || {};
                        }
                    }
                }).result.then(callback);
            }
        };
    });
})();