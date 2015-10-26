var LoginPage = require('../../../shared/e2e/loginPage');
var MenuPage = require('../../../shared/e2e/menuPage');
var UsersPage = require('../account/usersPage');
var AccountDetailsPage = require('./accountDetailsPage');

describe('Change Password', function() {
    var menuPage = new MenuPage();
    var loginPage = new LoginPage();
	var usersPage = new UsersPage();
	var accountDetailsPage = new AccountDetailsPage();

	// Cannot use testUser as it has no Context and it stuck the app
	var user = 'usm_user2';
	var pass = 'password12!@';

	var shortPass = 'pas*1';

	//To create a random name
	var passwordRandom = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
	passwordRandom = passwordRandom + '/*' + '24';

    beforeEach(function ()  {
        // login as administrator
        loginPage.visit();
        loginPage.login("usm_admin", "password","USM-UserManager - (no scope)");

        // select Users from menu
        menuPage.clickUsers();

        usersPage.setSearchUser(user);
		usersPage.clickSearchButton();
        // check the content of the serch results

		/*
		usersPage.getTableResultsRows().count().then(function (rowCount) {
			console.log("rowCount > 0 ==>> " + rowCount);
			return rowCount;
		}).then(function(rowCount){
			console.log("THEN rowCount="+rowCount);
			if(rowCount == 0) {
				//throw new Error('Solution not found');
			}
		});
		*/

		usersPage.getTableRows().each(function (row) {
			var columns = row.$$('td');

			columns.get(0).getText().then(function (value) {
				//console.log(user+" -> "+value);
				if (value === user) {
					//console.log("found: "+user+" equal to "+value);
					//console.log("inside each cycle user == value returning true");
					return true;
				} else {
					return false;
				}
			}).then(function(q) {
				//console.log("each cycle ended with value = " + q);
				if(q === false) {
					//console.log("here I can create the user, set the password, and create a user context");

					// Click the "New User" button
					usersPage.clickNewUserButton();

					// Fills the data of the new user
					usersPage.setUserName(user);
					usersPage.setFirstName('FirstName');
					usersPage.setLastName('LastName');
					usersPage.setStatus('Enabled');
					usersPage.setEmail('aa@aa.es');
					usersPage.setOrganisation('FRA');
					usersPage.setPhoneNumber('99999999');
					usersPage.clickSaveButton();

					// Apply a password to the newly created user
					usersPage.setSearchUser(user);
					usersPage.clickSearchButton();
					usersPage.clickDetailViewButton(0);
					expect(accountDetailsPage.getPageUrl()).toBe(browser.baseUrl +'#/usm/users/'+ user);
					accountDetailsPage.setPasswordButton();
					accountDetailsPage.informSetPasswordPanel(pass,pass);
					accountDetailsPage.savePasswordButton();

					// This line click on the User 'Context' tab
					element(by.linkText('Contexts')).click();

					// This line click on the 'New' button of the selected User Context
					element(by.id('new_user_context')).click();

					// This line click on the New dialog role's combobox
					var allRoles = element.all(by.options('role.name for role in roleList'));
					allRoles.each(function(option) {
						option.getText().then(function(opt) {
							//console.log("option: ", opt);
							if(opt == 'USM-UserManager') {
								option.click();
							}
						});
					});

					// This line click on the 'Save' button of the selected User Context
					element(by.buttonText('Save')).click();

					browser.wait(function() {
					  var deferred = protractor.promise.defer();
					  element(by.id('btn-success')).isPresent()
						.then(function (isPresent) {
						  deferred.fulfill(!isPresent);
						});
					  return deferred.promise;
					});

				}
			});
		});

		loginPage.gotoHome();
		menuPage.clickLogOut();

	   // login as the newly created user
        loginPage = new LoginPage()
        loginPage.visit();
		loginPage.login(user, pass);

        // select users from menu
		//menuPage.selectContext("USM-UserManager - (no scope)");
		menuPage.clickChangePassword();
    });

    it('Test 1 - should fail amend user password too short', function () {
        //Test 1. Same fields, but less than 8 characters
		menuPage.informSetPasswordPanel(pass, shortPass, shortPass);

        menuPage.clickSaveButton();
        expect(menuPage.getPanelMessage()).toEqual('Error: Password must contain at least 8 characters');
	});

	it('Test 2 - should test amend user password correct', function () {
        //Test 2. Successful password
		menuPage.informSetPasswordPanel(pass, passwordRandom, passwordRandom);

        menuPage.clickSaveButton();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });

        // set 2 more times new password in order to overcome the minHistory policy
        var previousPassword = passwordRandom;
        for(var i = 0 ; i < 2 ; i++) {
            //console.log("previousPassword: " + previousPassword);
            menuPage.clickChangePassword();
            menuPage.informSetPasswordPanel(previousPassword, pass+i, pass+i);
            menuPage.clickSaveButton();

			browser.wait(function() {
				var deferred = protractor.promise.defer();
				element(by.id('btn-success')).isPresent()
					.then(function (isPresent) {
						deferred.fulfill(!isPresent);
					});
				return deferred.promise;
			});

            previousPassword = pass+i;
        }

        // restore password
        menuPage.clickChangePassword();
        menuPage.informSetPasswordPanel(previousPassword, pass, pass);
        menuPage.clickSaveButton();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    });

    afterEach(function () {
       loginPage.gotoHome();

       menuPage.clickLogOut();
       //expect(loginPage.getPageUrl()).toBe('http://localhost:9001/app/#/login');

		browser.executeScript('window.sessionStorage.clear();');
		browser.executeScript('window.localStorage.clear();');
    });

});
