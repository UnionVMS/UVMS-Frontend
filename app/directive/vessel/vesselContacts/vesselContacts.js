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
angular.module('unionvmsWeb')
    .directive('vesselContacts', function() {
	return {
		restrict: 'E',
		replace: false,
        controller: 'vesselContactsCtrl',
        scope: {
        	vesselContacts : '=',
            disableForm : '=',
            functions : '=',
            dirtyStatus : '='
        },
		templateUrl: 'directive/vessel/vesselContacts/vesselContacts.html',
		link: function(scope, element, attrs, fn) {

		}
	};
});


angular.module('unionvmsWeb')
    .directive('contactItem', function() {
        return {
            restrict: 'E',
            replace: false,
            controller: 'vesselContactsCtrl',
            scope: {
                contactItem: '=',
                dirtyStatus : '='
            },
            link: function(scope, element, attrs, fn) {
            }
        };
    });


angular.module('unionvmsWeb')
    .controller('vesselContactsCtrl', function($scope, configurationService){

        $scope.countryCodes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), 'FLAG_STATE', 'VESSEL', true);

        $scope.orderByOwner = function (contact) {
            switch (contact.owner) {
                case true:
                    return 1;

                case false:
                    return 2;
            }
        };

        $scope.setVesselContactDirtyStatus = function(contact, status) {
            if (angular.isDefined(contact)) {
                contact.dirty = status;
            }
        };

        $scope.$watch('contactItem', function(newValue, oldValue){
            if (oldValue === undefined || newValue === undefined){
                return;
            }
            var oldValueJson = oldValue.copy().toJson();
            var newValueJson = newValue.copy().toJson();

            if (!angular.equals(oldValueJson, newValueJson)) {
                $scope.dirtyStatus(newValue, true);
                if (newValue.dirty === true || newValue.dirty === undefined) {
                    $scope.$parent.dirtyStatus(true);
                }
            }
            else {
                //$scope.$parent.dirtyStatus(false);
            }
        }, true);
    }
);
