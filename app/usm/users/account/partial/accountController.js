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
var accountModule = angular.module('account');

accountModule.controller('accountController', ['$scope', function ($scope) {

}]);

accountModule.controller('newUserController', ['$scope', '$modal', 'accountService', '$log','policyValues',
    function ($scope, $modal, accountService, $log, policyValues) {

        $scope.addNewUser = function (newUser) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                keyboard: true,
                templateUrl: 'usm/users/account/partial/newUser.html',
                controller: 'userModalInstanceCtrl',
                resolve: {
                    items: function () {
                        return $scope.usersList;
                    },
                    //userCreated: $scope.userCreated
                    newUser: function(){
                        return angular.copy(newUser);
                    },
                    ldapEnabledPolicy: function(){
                        return policyValues.getPolicyValue();
                    }
                }
            });
            // It is a promise that resolves when modal is closed and rejected when modal is dismissed
            modalInstance.result.then(function (newUser) {
                // Update the model (usersList)
                $scope.userList.push(newUser);
                $scope.displayedUsers = [].concat($scope.userList);
            }, function () {
            });

        };

    }]);

accountModule.controller('userModalInstanceCtrl', ['$scope', '$modalInstance', '$log', 'organisationsService', 'refData', 'accountService', '$timeout','ldapEnabledPolicy',
    function ($scope, $modalInstance, $log, organisationsService, refData, accountService, $timeout, ldapEnabledPolicy) {
        var confirmCreate = false;
        $scope.ldapEnabled = ldapEnabledPolicy[0].value;
        $scope.actionMessage = "";
        $scope.selectedStatus = "";
        $scope.organisation = {};
        $scope.userCreated = false;
        $scope.mandatoryNotes = false;
        $scope.formDisabled = false;
        //$scope.confirmCheckBox = true;
        //$scope.showConfirmation = false;
        var today = new Date();
        var activeFrom = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
        $scope.minDateTo = moment().format('YYYY-MM-DD');
        $scope.user = {
            activeTo: refData.activeDateTo,
            activeFrom: moment().format('YYYY-MM-DD')
        };

        $scope.changeStatus = function (status) {
            $scope.mandatoryNotes = status !== 'E';
        };

        // organisation dropdown
        organisationsService.get().then(
            function (response) {
                $scope.organisationsList = response.organisations;
            },
            function (error) {
                if(!_.isEqual(error.status, 404)) {
                    $scope.messageDivClass = "alert alert-danger";
                    $scope.actionMessage = error;
                }
            }
        );

        // status dropdown
        $scope.statusList = refData.statusesNoAll;

        $scope.copyFromLdap = function (user) {
//        	console.log(userName);
//        	$scope.ldapUser = {};

        	accountService.getLdapUser(user.userName).then(
	            function (response) {
		            $log.log(response);
		            $scope.ldapUser = response.ldapUser;
		            // Fill Data in the form...
		            //$scope.user = {};
                    user.userName = response.ldapUser.userName;
                    user.person = {};
		            user.person.firstName = $scope.ldapUser.firstName;
		            user.person.lastName = $scope.ldapUser.lastName;
		            user.person.email = $scope.ldapUser.email;
		            user.person.phoneNumber = $scope.ldapUser.phoneNumber;
		            user.person.mobileNumber = $scope.ldapUser.mobileNumber;
		            user.person.faxNumber = $scope.ldapUser.faxNumber;
		            $scope.actionMessage = "";
		            $scope.messageDivClass = "";
	            }, function (error) {
	            	// Error handler code
	            	$scope.messageDivClass = "alert alert-danger";
	            	if(error.status === 404){
	            		$scope.actionMessage = "User not found";
	            	}else{
	            		$scope.actionMessage = "Error: "+error.statusText;
	            	}
	            	$scope.ldapUser = {};
	            }
	        );
        };

        // Firefox marks as invalid date the one coming from the datepicker.
        // Try to build a javascript date from the input.
        var trasformDate = function(date) {
            var dateToken = date.split("-");
            var days = dateToken[2].split(" ")[0];
            return dateToken[0] + "-" + dateToken[1] + "-" + days;
        };

        $scope.save = function (user) {
            //if ($scope.showConfirmation) {
                // remove the parent name
            var copyUser = angular.copy(user);
            copyUser.activeFrom = new Date(trasformDate(copyUser.activeFrom));
            copyUser.activeTo = new Date(trasformDate(copyUser.activeTo));
            $log.log(copyUser.activeFrom);
            var userCreated=accountService.createNewObject(copyUser);
               $log.log(userCreated);
                $scope.formDisabled = true;
                accountService.saveUser(userCreated).then(
                    function (response) {
                        $scope.messageDivClass = "alert alert-success";
                        $scope.actionMessage = "User created";
                        // Close modal by passing the new user to update the table
                        $scope.newUser = response.newUser;
                        $scope.userCreated = true;
                        $timeout(function () {
                            $modalInstance.close($scope.newUser);
                        }, 2000);
                    },
                    function (error) {
                        $scope.messageDivClass = "alert alert-danger";
                        $scope.actionMessage = error;
                        $scope.formDisabled = false;
                    }
                );
            //} else {
            //    $scope.showConfirmation = true;
            //    $scope.confirmCheckBox = false;
            //}
        };

        // use this watches to check the existence of the From/To dates
        $scope.$watch('user.activeFrom', function (newValue, oldValue) {
            if (!_.isNull(oldValue) || !_.isNull(newValue)) {
                $scope.showActiveFromError = !(!_.isUndefined(newValue) && !_.isNull(newValue));
            }
        }, true);
        $scope.$watch('user.activeTo', function (newValue, oldValue) {
            if (!_.isNull(oldValue) || !_.isNull(newValue)) {
                $scope.showActiveToError = !(!_.isUndefined(newValue) && !_.isNull(newValue));
            }
        }, true);

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        // activeFrom date configuration
        $scope.activeFromConfig =
        {
            id: 'activeFrom',
            dataModel: 'user.activeFrom',
            defaultValue: moment().format('YYYY-MM-DD'),
            name: 'activeFrom',
            isRequired: true,
            page: 'createUser'
        };
        // activeTo date configuration
        $scope.activeToConfig =
        {
            id: 'activeTo',
            dataModel: 'user.activeTo',
            defaultValue: refData.activeDateTo,
            name: 'activeTo',
            isRequired: true,
            page: 'createUser'
        };


    }]);