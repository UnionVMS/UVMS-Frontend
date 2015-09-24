var policiesService = angular.module('policiesService', ['ngResource']);

policiesService.factory('policiesService', ['$resource', '$q', '$log', function ($resource, $q, $log) {

	var _getPolicySubjList = function() {
  		var message = "";
		var deferred = $q.defer();
		var resource = $resource('/usm-administration/rest/policies/subjects');
		resource.get().$promise.then(
			function (data) {
				deferred.resolve({
					subjects: data.results
				});
			},
			function (error) {
				message = 'Error: ' + error.data.message;
				deferred.reject(message);
			}
		);
		
		return deferred.promise;
	};
		
	var _updatePolicy = function (policy) {
        var message = "";
        var deferred = $q.defer();
		var resource = $resource('/usm-administration/rest/policies', '', {updatePolicy: {method: 'PUT'}} );
		
		resource.updatePolicy(policy).$promise.then(
            function (data) {
                deferred.resolve({
                    updatedPolicy: data
                });
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
	};
	
	var _getPoliciesList = function (criteria) {
		//$log.log("_getPoliciesList -> criteria: ", criteria);
		var message = "";
		var deferred = $q.defer();
		
		var resource = $resource('/usm-administration/rest/policies');
		resource.query(criteria).$promise.then(
			function (data) {
				deferred.resolve({
					policies: data
				});
			},
			function (error) {
				message = 'Error: ' + error.data.message;
				deferred.reject(message);
			}
		);
		
		/*
		var originalArray = [
				{policyId: 1,  name: "password.minLength", 	 description: "Password minimum length", 							subject: "password", value: "8"},
				{policyId: 2,  name: "password.minSpecial", 	 description: "Password minimum number of special characters", 		subject: "password", value: "1"},
				{policyId: 3,  name: "password.minDigits", 	 description: "Password minimum number of digits", 					subject: "password", value: "1"},
				{policyId: 4,  name: "password.minHistory", 	 description: "Password minimum number of changes before reuse", 	subject: "password", value: "3"},
				{policyId: 5,  name: "password.maxValidity", 	 description: "Password validity in days of a freshly changed password", subject: "password", value: "90"},
				{policyId: 10, name: "account.maxSession", 	 description: "Maximum number of concurrent sessions with the same user", subject: "account", value: "0"},
				{policyId: 11, name: "account.lockoutFreshold", description: "Number of consecutive failed logins that will trigger an account lockout", subject: "account", value: "5"},
				{policyId: 12, name: "account.lockoutDuration", description: "Account lockout duration in minutes", subject: "account",  value: "30"},
				{policyId: 21,     name: "change.password.enabled", description: "Enable (true) or disable (false) the <<Change Password>> feature", subject: "feature", value: "true"},
				{policyId: 100000, name: "ldap.enabled", description: "Flag that controls whether LDAP based authentication is enabled (value \"true\") or disabled (value \"false\"", subject: "Authentication", value: "false"},
				{policyId: 100001, name: "ldap.server.url", description: "URL for the LDAP server (e.g. ldaps://ldap.domain.org:636/)", subject: "Authentication", value: "ldaps://svm-midway.athens.intrasoft-intl.private:10636/"},
				{policyId: 100002, name: "ldap.context.root", description: "Distinguished Name of the directory node under which users are searched for", subject: "Authentication", value: "ou=users;ou=system"},
				{policyId: 100003, name: "ldap.bind.dn", description: "Distinguished Name of the LDAP user account used to query the directory", subject: "Authentication", value: "uid=admin;ou=system"},
				{policyId: 100004, name: "ldap.bind.password", description: "Password of the LDAP user account used to query the directory", subject: "Authentication", value: "secret"},
				{policyId: 100005, name: "ldap.query.filter", description: "LDAP query used to retrieve the distinguished name of a user, given the USM user name", subject: "Authentication", value: "(&(objectClass=person)(uid={0}))"},
				{policyId: 100006, name: "ldap.query.attributes", description: "Comma separated list of LDAP attributes to be retrieved from a user account", subject: "Authentication", value: "sn,givenName,mail"},
				{policyId: 100007, name: "ldap.enabled", description: "Flag that controls whether LDAP based authentication is enabled for user administration (value \"true\" or disabled (value \"false\"", subject: "Administration", value: "true"},
				{policyId: 100008, name: "ldap.server.url", description: "URL for the LDAP server for user administration (e.g. ldaps://ldap.domain.org:636/)", subject: "Administration", value: "ldaps://svm-midway.athens.intrasoft-intl.private:10636/"},
				{policyId: 100009, name: "ldap.context.root", description: "Distinguished Name of the directory node under which users are searched for when using LDAP in user administration", subject: "Administration", value: "ou=users;ou=system"},
				{policyId: 100010, name: "ldap.bind.dn", description: "Distinguished Name of the LDAP user account used to query the directory when using LDAP in user administration", subject: "Administration", value: "uid=admin;ou=system"},
				{policyId: 100011, name: "ldap.bind.password", description: "Password of the LDAP user account used to query the directory", subject: "Administration", value: "secret"},
				{policyId: 100012, name: "ldap.query.filter", description: "LDAP query used to retrieve the distinguished name of a user, given the USM user name when using LDAP in user administration", subject: "Administration", value: "(&(objectClass=person)(uid={0}))"},
				{policyId: 100013, name: "ldap.query.attributes", description: "Comma separated list of LDAP attributes to be retrieved from a user account when using LDAP in user administration", subject: "Administration", value: "sn,givenName,mail"},
				{policyId: 100014, name: "ldap.label.firstName", description: "The user attribute mapping to the firstName label on the UI when using LDAP in user administration", subject: "Administration", value: "cn"},
				{policyId: 100015, name: "ldap.label.lastName", description: "The user attribute mapping to the lastName label on the UI when using LDAP in user administration", subject: "Administration", value: "givenName"},
				{policyId: 100016, name: "ldap.label.telephoneNumber", description: "The user attribute mapping to the telephoneNumber label on the UI when using LDAP in user administration", subject: "Administration", value: "telephoneNumber"},
				{policyId: 100017, name: "ldap.label.mobileNumber", description: "The user attribute mapping to the mobileNumber label on the UI when using LDAP in user administration", subject: "Administration", value: "mobile"},
				{policyId: 100018, name: "ldap.label.faxNumber", description: "The user attribute mapping to the faxNumber label on the UI when using LDAP in user administration", subject: "Administration", value: "facsimileTelephoneNumber"},
				{policyId: 100019, name: "ldap.label.mail", description: "The user attribute mapping to the mail label on the UI when using LDAP in user administration", subject: "Administration", value: "mail"},
				{policyId: 100020, name: "update.contact.details.enabled", description: "Enable (true) or disable (false) the <<Update Contact Details>> feature", subject: "feature", value: "true"},
				{policyId: 100021, name: "review.contact.details.enabled", description: "Enable (true) or disable (false) the <<Review Contact Details Updates before they become effective>> feature", subject: "feature", value: "false"}
				];
				
		var filteredArray = [];
		
		for(var i = 0; i < originalArray.length; i++) {
			if(!criteria.name && !criteria.subject) {
				//$log.log("criterias are null passing all");
				filteredArray.push(originalArray[i]);
			}
			else {
				//$log.log("criterias are NOT null filtering", criteria);
				var nameDefined = false;
				var subjDefined = false;
				if(criteria.name && criteria.subject) {
					//$log.log("criterias are BOTH defined");
					if(originalArray[i].name.toUpperCase().indexOf(criteria.name.toUpperCase()) > -1 && 
							originalArray[i].subject.toUpperCase().indexOf(criteria.subject.toUpperCase()) > -1) {
						filteredArray.push(originalArray[i]);
					}
				}
				else if(criteria.name && !criteria.subject) {
					//$log.log("criterias.name ONLY is defined");
					if(originalArray[i].name.toUpperCase().indexOf(criteria.name.toUpperCase()) > -1) {
						filteredArray.push(originalArray[i]);
					}
				}
				else if(!criteria.name && criteria.subject) {
					//$log.log("criteria.subject ONLY is defined");
					if(originalArray[i].subject.toUpperCase().indexOf(criteria.subject.toUpperCase()) > -1) {
						filteredArray.push(originalArray[i]);
					}
				}
			}			
		}
		$log.log(filteredArray);		
		
		// mock data
		deferred.resolve({
			policies: filteredArray
		});
		*/
		
		return deferred.promise;
	};

	return {
		getPoliciesList: _getPoliciesList,
		getPolicySubjList: _getPolicySubjList,
		updatePolicy: _updatePolicy
    };	
}]);

