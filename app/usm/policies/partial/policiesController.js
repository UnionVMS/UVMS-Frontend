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

policiesModule.controller('policiesListController', ['$scope', '$resource', '$log', '$stateParams', '$timeout', 'policiesService', 'userService',
    function ($scope, $resource, $log, $stateParams, $timeout, policiesService, userService) {


        $scope.checkAccess = function(feature) {
        	return userService.isAllowed(feature, "USM", true);
        };

		var resetSearchValues = function() {
			$scope.search = {};
            $scope.search.name = '';
            $scope.search.subject = '';
		};

		var fillPolicySubjects = function() {
			policiesService.getPolicySubjList().then(function(obj) {
				//$log.log("results: ", obj);
				$scope.displayedPoliciesSubjInit = obj.subjects;
			},
			function (error) {
				$scope.emptyResultMessage = error;
			});
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

			//$scope.displayedPoliciesSubjInit = ['account', 'password'];
			fillPolicySubjects();

			callService($scope.criteria);
		};

		initList();

	}]);

policiesModule.controller('managePolicyCtlr', ['$log', '$scope', '$modal', '$stateParams',
	function ($log, $scope, $modal, $stateParams) {
        $scope.editPolicy = function (policy) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: true,
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
                //$log.log(returnedPolicy);
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
                    $scope.messageDivClass = "container alert alert-success";
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
                    $scope.messageDivClass = "container alert alert-danger";
                    $scope.actionMessage = error;
                }
            );
			//$scope.policyUpdated = true;
			//$scope.messageDivClass = "container alert alert-success";
			//$scope.actionMessage = "User Details Saved";
			//$timeout(function () {
			//	$modalInstance.close(policy);
			//}, 2000);
        };

	}]);
