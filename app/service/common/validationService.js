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
(function(){

    var validationService = function(){

        var digitsOnly = function(data){
            return /^[0-9]*$/.test(data);
        };
        var lettersOnly = function (data){
            return /^[A-ZÅÄÖa-zåäö ]*$/.test(data);
        };
        var lettersAndDigits = function(data){
            return /^[A-ZÅÄÖa-zåäö0-9 _]*[A-Za-z0-9][A-ZÅÄÖa-zåäö0-9 -]*$/.test(data);
        };

        return{
            digitsOnly: digitsOnly,
            lettersOnly: lettersOnly,
            lettersAndDigits: lettersAndDigits
        };
    };

    var module = angular.module('unionvmsWeb');
    module.factory('validationService',validationService);

}());


/*
angular.module('unionvmsWeb').factory('uvmsValidation',function() {

	var uvmsValidation = {};

	return uvmsValidation;
});*/