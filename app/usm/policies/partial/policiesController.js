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
var policiesModule = angular.module('policies');

policiesModule.directive('stResetSearch', function() {
	return {
		restrict: 'EA',
		require: '^stTable',
		link: function(scope, element, attrs, ctrl) {
			return element.bind('click', function() {
				return scope.$apply(function() {
					var tableState;
					tableState = ctrl.tableState();
					tableState.search.predicateObject = {};
					tableState.pagination.start = 0;
					return ctrl.pipe();
				});
			});
		}
	};
});
/*
policiesModule.directive('stSubmitSearch', function() {
	return {
		restrict: 'EA',
		require: '^stTable',
		link: function(scope, element, attrs, ctrl) {
			return element.bind('click', function() {
				return scope.$apply(function() {
					return ctrl.pipe();
				});
			});
		}
	};
});
*/
policiesModule.directive('ngEnter', function() {
	return function(scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if(event.which === 13) {
				scope.$apply(function(){
					scope.$eval(attrs.ngEnter, {'event': event});
				});
				event.preventDefault();
			}
		});
	};
});

policiesModule.controller('policiesListController', ['$scope', '$resource', '$log', '$stateParams', '$timeout', 'policiesService', 'userService','policySubjects',
    function ($scope, $resource, $log, $stateParams, $timeout, policiesService, userService, policySubjects) {


        $scope.checkAccess = function(feature) {
        	return userService.isAllowed(feature, "USM", true);
        };

		var resetSearchValues = function() {
			$scope.search = {};
            $scope.search.name = '';
            $scope.search.subject = '';
		};

        var fillPolicySubjects = function() {
            // transform to dropdown input
            var policiesDropDown = [];
            angular.forEach(policySubjects, function(item){
                var policy = {};
                policy.label = item;
                policy.value = item;
                policiesDropDown.push(policy);
            });
            $scope.displayedPoliciesSubjInit = policiesDropDown;
        };
		var callService = function(criteria) {
			if(criteria.name === '') {
				criteria.name = undefined;
			}
			//$log.log(criteria);

			// simulating a XMLHttpRequest request delay and retrieve mock data
			//$timeout(function () {
				policiesService.getPoliciesList(criteria).then(function(obj) {
					$scope.displayedPolicies = obj.policies;
					if($scope.displayedPoliciesInit === undefined) {
						$scope.displayedPoliciesInit = angular.copy($scope.displayedPolicies);
					}
					$scope.sortPolicies = $scope.displayedPolicies;
					//$log.log($scope.displayedPolicies);
					//$log.log($scope.sortPolicies);
					$scope.isDataLoading = false;

					$scope.emptyResult = $scope.displayedPolicies.length === 0 ? true : false;
				});
			//}, 1000);
		};

        $scope.searchPolicies = function (obj) {
			//$log.log("searching: ", obj);
			$scope.criteria.name = obj.name;
			$scope.criteria.subject = obj.subject;

            $scope.currentPage = 1;
        	$scope.paginationConfig.currentPage = 1;

			/*
            if ($scope.search.name !== null && $scope.search.name !== '' && !_.isUndefined($scope.search.name) ){
                $scope.pageData.name = $scope.search.name;
			} else {
                $scope.pageData.name = '';
            }

			if ($scope.search.subject  !== null && $scope.search.subject  !== '' && !_.isUndefined($scope.search.subject)){
                $scope.pageData.subject = $scope.search.subject;
			} else {
				$scope.pageData.subject = '';
            }
			*/

			callService($scope.criteria);
        };

        $scope.resetForm = function(){
			//$log.log("reset form");

            $scope.currentPage = 1;

			resetSearchValues();

            $scope.criteria = {};
            $scope.pageData = {};

			$scope.policySubjSelected = undefined;

			// simulating a XMLHttpRequest request delay and retrieve mock data
			callService($scope.criteria);
        };

		var initList = function(){
			//setting up the pagination directive configuration
			$scope.paginationConfig =
			{
				currentPage: parseInt($stateParams.page) || 1,
				pageCount: '',
				totalItems: '',
				itemsPerPage: 10
			};
        	$scope.paginationConfig.currentPage = 1;
            $scope.currentPage = 1;

			resetSearchValues();

			$scope.displayedPoliciesInit = undefined;
			$scope.policySubjSelected = undefined;

			$scope.displayedPolicies = {};
            $scope.criteria = {};
            $scope.pageData = {};

			// flagging whether the loading message must be displayed
			$scope.isDataLoading = true;

			//To control the empty and loading table messages
			$scope.emptyResult = false;
			$scope.emptyResultMessage = "No results found. ";
			$scope.loadingMessage = "Loading... taking some time";

			$scope.criteria = {};

			//$scope.displayedPoliciesSubjInit = ['Authentication', 'password'];
			fillPolicySubjects();

			callService($scope.criteria);
		};

		initList();

        $scope.sort = {
            sortColumn: 'name', // Default Sort.
            sortDirection: 'asc'
        };

        $scope.changeSorting = function (column) {
            var sort = $scope.sort;
            if (sort.sortColumn === column) {
                if (sort.sortDirection === 'desc') {
                    sort.sortDirection = 'asc';
                } else if (sort.sortDirection === 'asc') {
                    sort.sortDirection = 'desc';
                }
            } else {
                sort.sortColumn = column;
                sort.sortDirection = 'asc';
            }
            $scope.sort.sortColumn = column;
            $scope.sort.sortDirection = sort.sortDirection;
            //$scope.getPage($scope.paginationConfig.currentPage);
        };

        $scope.sortIcon = function (column) {
            var sort = $scope.sort;
            if (sort.sortColumn === column) {
                var sortDirection = sort.sortDirection;
                return sortDirection === 'desc' ? 'fa-sort-desc' : 'fa-sort-asc';
            }
            return 'fa-sort';
        };

	}]);

policiesModule.controller('managePolicyCtlr', ['$log', '$scope', '$modal', '$stateParams',
	function ($log, $scope, $modal, $stateParams) {
        $scope.editPolicy = function (policy) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                keyboard: true,
                size: 'md',
                templateUrl: 'usm/policies/partial/editPolicy.html',
                controller: 'editPolicyModalInstanceCtrl',
                resolve: {
                    policy: function () {
                        return angular.copy(policy);
                    }
                }
            });

            // It is a promise that resolves when modal is closed and rejected when modal is dismissed
            modalInstance.result.then(function (returnedPolicy) {
                // Update the model (policy)
                //$log.log('returnedPolicy', returnedPolicy);
                if (_.isEqual('ldap.enabled',returnedPolicy.name) && _.isEqual('Authentication',returnedPolicy.subject)) {
                    $scope.$emit('ldapPolicyChanged');
                }
                if (!_.isUndefined($stateParams.policyName)) {
                    $scope.policy = returnedPolicy;
                }
                angular.copy(returnedPolicy, policy);
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };
	}]);

policiesModule.controller('editPolicyModalInstanceCtrl', ['$log', '$timeout', '$location', '$scope', '$modalInstance', '$stateParams', 'refData', 'policy', 'policiesService',
    function ($log, $timeout, $location, $scope, $modalInstance, $stateParams, refData, policy, policiesService) {
        $scope.formDisabled = true;
        $scope.editForm = true;
        $scope.showSubmit = false;
        $scope.showEdit = true;
        $scope.policyUpdated = false;
        $scope.policy = policy;

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.changeEditForm = function () {
			//$log.log("changeEditForm");
            $scope.formDisabled = !$scope.formDisabled;
            $scope.showSubmit = !$scope.showSubmit;
            $scope.showEdit = !$scope.showEdit;
        };

        $scope.updatePolicy = function (policy) {
			$scope.policyUpdated = true;
            policiesService.updatePolicy(policy).then(
                function (response) {
                    $scope.policyUpdated = true;
                    $scope.messageDivClass = "alert alert-success";
                    $scope.actionMessage = "Policy Saved";
                    if (_.isEqual("review.contact.details.enabled", policy.name)) {
                        $scope.$emit("ReviewContactDetails");
                    }
                    $timeout(function () {
                        $modalInstance.close(policy);
                    }, 2000);
                },
                function (error) {
					$scope.policyUpdated = false;
                    $scope.messageDivClass = "alert alert-danger";
                    $scope.actionMessage = error;
                }
            );
			//$scope.policyUpdated = true;
			//$scope.messageDivClass = "alert alert-success";
			//$scope.actionMessage = "User Details Saved";
			//$timeout(function () {
			//	$modalInstance.close(policy);
			//}, 2000);
        };

	}]);