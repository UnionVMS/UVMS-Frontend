var accountModule = angular.module('account');

accountModule.controller('accountController', ['$scope', function ($scope) {

}]);

accountModule.controller('newUserController', ['$scope', '$modal', 'accountService', '$log','policyValues',
    function ($scope, $modal, accountService, $log, policyValues) {

        $scope.addNewUser = function (newUser) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: true,
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
                        var ldapEnabledPolicy = policyValues.getPolicyValue();
                        return ldapEnabledPolicy;
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
        $scope.minDateTo = moment().format('YYYY-MM-DD');
        $scope.user = {
            activeTo: refData.activeDateTo,
            activeFrom: moment().format('YYYY-MM-DD')
        };

        $scope.changeStatus = function (status) {
            if (status !== 'E') {
                $scope.mandatoryNotes = true;
            } else {
                $scope.mandatoryNotes = false;
            }
        };

        // organisation dropdown
        organisationsService.get().then(
            function (response) {
                $scope.organisationsList = response.organisations;
            },
            function (error) {
                if(!_.isEqual(error.status, 404)) {
                    $scope.messageDivClass = "container alert alert-danger";
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
		            $scope.user = {};
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
	            	$scope.messageDivClass = "container alert alert-danger";
	            	if(error.status === 404){
	            		$scope.actionMessage = "User not found";
	            	}else{
	            		$scope.actionMessage = "Error: "+error.statusText;
	            	}
	            	$scope.ldapUser = {};
	            }
	        );
        };

        $scope.save = function (user) {
            //if ($scope.showConfirmation) {
                // remove the parent name
            var userCreated=accountService.createNewObject(user);
               $log.log(user);
                $scope.formDisabled = true;
                accountService.saveUser(userCreated).then(
                    function (response) {
                        $scope.messageDivClass = "container alert alert-success";
                        $scope.actionMessage = "User created";
                        // Close modal by passing the new user to update the table
                        $scope.newUser = user;
                        $scope.userCreated = true;
                        $timeout(function () {
                            $modalInstance.close($scope.newUser);
                        }, 2000);
                    },
                    function (error) {
                        $scope.messageDivClass = "container alert alert-danger";
                        $scope.actionMessage = error;
                        $scope.formDisabled = false;
                    }
                );
            //} else {
            //    $scope.showConfirmation = true;
            //    $scope.confirmCheckBox = false;
            //}
        };




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
