var LoginPage = require('../../../shared/e2e/loginPage');
var MenuPage = require('../../../shared/e2e/menuPage');
var UsersPage = require('../account/usersPage');
var PoliciesPage = require('../../../policies/e2e/policiesPage');
var ChangesPage = require('./changesPage');

describe('User Changes page', function () {
    var menuPage = new MenuPage();
    var loginPage = new LoginPage();
    var usersPage = new UsersPage();
    var policiesPage = new PoliciesPage();
    var changesPage = new ChangesPage();

    var userPendingChange = "quota_usr_com";
    var userPendingChangeExist = false;
    var userPendingChangeIndex;

    beforeEach(function () {
        // login
        loginPage.visit();
        loginPage.login('usm_admin', 'password',"USM-UserManager - (no scope)");

        // select Users from menu
        menuPage.clickPolicies();

        // check if policy 'review.contact.details.enabled' is 'true'. if 'false' enable it.
        policiesPage.search("review.contact.details.enabled", "Feature");
        policiesPage.getTableRows().each(function (row) {
            var columns = row.$$('td');

            columns.get(3).getText().then(function (value) {
                if (value == 'false') {
                    policiesPage.clickDetailButton(0);
                    policiesPage.clickModalEditButton();
                    policiesPage.setModalPolicyValue('true');
                    policiesPage.clickModalSaveButton();
					browser.wait(function() {
						var deferred = protractor.promise.defer();
						element(by.id('btn-success')).isPresent()
							.then(function (isPresent) {
								deferred.fulfill(!isPresent);
							});
						return deferred.promise;
					});
                }

                menuPage.clickChanges();

                // get the index of the pending change
                changesPage.getTableResultsRows().each(function (row, index) {
                    var columns = row.$$('td');
                    columns.get(0).getText().then(function (username) {
                        if (username == userPendingChange) {
                            userPendingChangeExist = true;
                            userPendingChangeIndex = index;
							//console.log("userPendingChangeIndex: "+userPendingChangeIndex);
                        }
                    });
                });
            });
        });
    });

    it('should test changes approve', function () {

		var phoneNewValue, mobileNewValue, faxNewValue, emailNewValue;

		var EC = protractor.ExpectedConditions;

		var anyTextToBePresentInElement = function(elementFinder) {
			var hasText = function() {
				return elementFinder.getText().then(function(actualText) {
					//console.log("element :"+elementFinder+" contains : '"+actualText+"'");
					return actualText;
				});
			};
			return elementFinder.getText().then(function(actualText) {
				//console.log("ZZZZZZZZZZZZZZZZZZZ element :"+elementFinder+" contains : '"+actualText+"'");
			});
			return EC.and(EC.presenceOf(elementFinder), hasText);
		};
		/*
		var anyValueAttrToBePresentInElement = function(elementFinder) {
			var hasValueAttr = function() {
				return elementFinder.getAttribute("value").then(function(actualValue) {
					return actualValue;
				});
			};
			return EC.and(EC.presenceOf(elementFinder), hasValueAttr);
		};
		*/

        var consumeChange = function () {
            changesPage.clickDetailButton(userPendingChangeIndex);
            changesPage.phoneNewValue.getAttribute('value').then(function (text) {
                phoneNewValue = text;
            });
            changesPage.mobileNewValue.getAttribute('value').then(function (text) {
                mobileNewValue = text;
            });
            changesPage.faxNewValue.getAttribute('value').then(function (text) {
                faxNewValue = text;
            });
            changesPage.emailNewValue.getAttribute('value').then(function (text) {
                emailNewValue = text;
            });
            changesPage.clickApproveButton();
            // check the changes in user contact details
            menuPage.clickUsers();
            usersPage.search(userPendingChange);
            usersPage.clickSearchButton();
			browser.waitForAngular();
            usersPage.clickDetailButton(0);
			browser.waitForAngular();
            usersPage.phoneNumber.getAttribute("value").then(function(phoneNumber){
				browser.wait(anyTextToBePresentInElement(usersPage.phoneNumber, 5000));
				//browser.wait(anyValueAttrToBePresentInElement(usersPage.phoneNumber, 5000));
                //expect(phoneNumber[0]).toBe(phoneNewValue[0]);
            });
        };

		var resumeChange = function () {
            loginPage.gotoHome();
            menuPage.clickLogOut();

			browser.waitForAngular();

            loginPage.visit();
            loginPage.login(userPendingChange, 'password',"USM-UserManager - (no scope)");
            menuPage.clickUpdateContactDetails();

            changesPage.updateContactDetailsPhone.getAttribute("value").then(function(text){
               if (text == "") {
                   changesPage.setUpdateContactDetailsPhone("+32287654321");
               } else {
                   changesPage.setUpdateContactDetailsPhone("");
               }
            });
            changesPage.setUpdateContactDetailsPassword("password");
            changesPage.clickUpdateContactDetailsSaveButton();
        };

        // if a pending change for quota_usr_com exist
        if (userPendingChangeExist===true) {
            consumeChange();
            resumeChange();
        } else {
            resumeChange();
        }

        browser.waitForAngular();
    });

    it('should test changes reject', function () {
        var phoneNewValue, mobileNewValue, faxNewValue, emailNewValue;

		var EC = protractor.ExpectedConditions;

		var anyTextToBePresentInElement = function(elementFinder) {
			var hasText = function() {
				return elementFinder.getText().then(function(actualText) {
					return actualText;
				});
			};
			return EC.and(EC.presenceOf(elementFinder), hasText);
		};

		var anyValueAttrToBePresentInElement = function(elementFinder) {
			var hasValueAttr = function() {
				return elementFinder.getAttribute("value").then(function(actualValue) {
					return actualValue;
				});
			};
			return EC.and(EC.presenceOf(elementFinder), hasValueAttr);
		};

        var consumeChange = function () {
            changesPage.clickDetailButton(userPendingChangeIndex);
            changesPage.phoneNewValue.getAttribute('value').then(function (text) {
                phoneNewValue = text;
            });
            changesPage.mobileNewValue.getAttribute('value').then(function (text) {
                mobileNewValue = text;
            });
            changesPage.faxNewValue.getAttribute('value').then(function (text) {
                faxNewValue = text;
            });
            changesPage.emailNewValue.getAttribute('value').then(function (text) {
                emailNewValue = text;
            });
            changesPage.clickRejectButton();
            // check the changes in user contact details
            menuPage.clickUsers();
            usersPage.search(userPendingChange);
            usersPage.clickSearchButton();
			browser.waitForAngular();
            usersPage.clickDetailButton(0);
			browser.waitForAngular();

            usersPage.phoneNumber.getAttribute("value").then(function(phoneNumber){
				//browser.wait(anyTextToBePresentInElement(usersPage.phoneNumber, 5000));
				//browser.wait(anyValueAttrToBePresentInElement(usersPage.phoneNumber, 5000));
                //expect(phoneNumber[0]).not.toBe(phoneNewValue[0]);
            });
        };
        var resumeChange = function () {
            loginPage.gotoHome();
            menuPage.clickLogOut();

            loginPage.visit();
            loginPage.login(userPendingChange, 'password',"USM-UserManager - (no scope)");
            menuPage.clickUpdateContactDetails();

            changesPage.updateContactDetailsPhone.getAttribute("value").then(function(text){
                if (text == "") {
                    changesPage.setUpdateContactDetailsPhone("+32287654321");
                } else {
                    changesPage.setUpdateContactDetailsPhone("");
                }
            });
            changesPage.setUpdateContactDetailsPassword("password");
            changesPage.clickUpdateContactDetailsSaveButton();
        };

        // if a pending change for quota_usr_com exist
        if (userPendingChangeExist===true) {
            consumeChange();
            resumeChange();
        } else {
            resumeChange();
        }

        browser.waitForAngular();
    });

    afterEach(function () {
        loginPage.gotoHome();
        // logout
        menuPage.clickLogOut();
    });
});
