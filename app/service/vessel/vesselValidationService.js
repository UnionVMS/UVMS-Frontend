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
angular.module('unionvmsWeb').factory('vesselValidationService',function() {

	var vesselValidationService = {
        getCFRPattern : function(){
            //3 letters followed by 9 digits an/or letters (including swedish åäö)
            return new RegExp(/^[a-zA-ZåäöÅÄÖ]{3}[0-9a-zA-ZåäöÅÄÖ]{9}$/);
        },
        getMMSIPattern : function(){
            //9 digits
            return new RegExp(/^[0-9]{9}$/);
        },
        getMaxTwoDecimalsPattern : function(){
            return new RegExp(/^[0-9]+([,.][0-9]{0,2}?)?$/);
        },
        getlengthOverAllPattern : function() {
            return new RegExp(/^[0-9]{0,4}([,.][0-9]{0,2})?$/);
        },
        getIMOPattern: function() {
            return new RegExp(/^[0-9]{7}$/);
        },
        getProducerCodePattern: function() {
            return new RegExp(/^\d{1,10}$/);
        },
        getGUIDPattern : function() {
            //5 Words each followed by dash (example: abc12345-6789-abc1-2345-6789abc12345). 
            return new RegExp(/^\S+[-]\S+[-]\S+[-]\S+[-]\S+/);
        }
    };

	return vesselValidationService;
});
