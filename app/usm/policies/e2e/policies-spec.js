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
var LoginPage = require('../../shared/e2e/loginPage');
var MenuPage = require('../../shared/e2e/menuPage');
var PoliciesPage = require('./policiesPage');

describe('Policies page', function () {
    var menuPage = new MenuPage();
    var loginPage = new LoginPage();
    var policiesPage = new PoliciesPage();
    var initialPoliciesCount;
    var finalPoliciesCount;

    beforeEach(function () {
        // login
        loginPage.visit();
        loginPage.login('usm_admin', 'password',"USM-UserManager - (no scope)");

        // select policies from menu
        menuPage.clickPolicies();

        // take the count before searching
        policiesPage.getTableRows().count().then(function (rowCount) {
            initialPoliciesCount = rowCount;
			//console.log("initialPoliciesCount: " + initialPoliciesCount);
            expect(initialPoliciesCount > 0).toBeTruthy();
        });
    });

    it('should test policies page filters', function () {
        // set the criteria and search
        policiesPage.search("account.lockoutDuration", "Authentication");

        // take the count after searching
        policiesPage.getTableRows().count().then(function (rowCount) {
            finalPoliciesCount = rowCount;
			//console.log("finalPoliciesCount: " + finalPoliciesCount);
            // check the new count to be less equal to the inital one
            expect(finalPoliciesCount <= initialPoliciesCount).toBeTruthy();
        });

        // check the content of the serch results
        policiesPage.getTableRows().each(function (row) {
            var columns = row.$$('td');
            expect(columns.get(0).getText()).toMatch(/account.lockoutDuration/);
            expect(columns.get(2).getText()).toBe('Authentication');
        });
    });

    it('should test policies edit value', function () {
        // set the criteria and search
        policiesPage.search("account.lockoutDuration", "Authentication");

        var rowToSelect = Math.floor((Math.random() * initialPoliciesCount - 1) + 1);
        var columns = policiesPage.getTableRow(0).$$('td');

		//console.log("rows: " + rowToSelect);
		//console.log("cols: ", columns.length);

        // retrieve row information and assign them in page variables for future use
        //columns.get(4).element(by.id('editPolicy')).click();
    });

    afterEach(function () {
		loginPage.gotoHome();

		// logout
        menuPage.clickLogOut();

		browser.executeScript('window.sessionStorage.clear();');
		browser.executeScript('window.localStorage.clear();');
    });
});