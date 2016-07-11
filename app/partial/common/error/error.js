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

    app.controller('errorCtrl', function($scope, errorService, locale) {
        //Set texts
        $scope.error = errorService.getErrorMessage();
        //set the header text
        $scope.title = locale.getString('common.loading_page_error');
        if($scope.title.indexOf('%%KEY_NOT_FOUND%%') >= 0){
            $scope.title = 'Error loading page';
        }
        //set the error text
        $scope.errorText = locale.getString('common.loading_page_error_text');
        if($scope.errorText.indexOf('%%KEY_NOT_FOUND%%') >= 0){
            $scope.errorText = '';
        }
        //set the error details header text
        $scope.errorDetailsTitle = locale.getString('common.loading_page_error_details');
        if($scope.errorDetailsTitle.indexOf('%%KEY_NOT_FOUND%%') >= 0){
            $scope.errorDetailsTitle = 'Error details:';
        }

    });

    angular.module('unionvmsWeb')
        .factory('errorService',function() {

            var errorMessage;
            return {
                getErrorMessage : function(){
                    return errorMessage;
                },
                setErrorMessage : function(message){
                    errorMessage = message;
                },
            };
        });
})();