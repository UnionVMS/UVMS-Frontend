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
var ApplicationsPage = require('./applicationsPage');

describe('Application page', function() {
    var menuPage = new MenuPage();
    var loginPage = new LoginPage();
    var applicationsPage = new ApplicationsPage();

    var initialApplicationsCount;
    var finalApplicationsCount;

    var testCountRowsTable = function(){
        //take the count after searching
        applicationsPage.getTableRows().count().then(function (rowCount) {
            finalApplicationsCount = rowCount;
            //console.log(rowCount);
            // check the new count to be less or equal to the initial one
            expect(finalApplicationsCount <= initialApplicationsCount).toBeTruthy();
        });
    }

    var testRowsApplicationsTable = function (name, description, parent) {
        applicationsPage.getTableRows().each(function (row) {
            var columns = row.$$('td');
            expect(columns.get(0).getText()).toMatch(name);
            expect(columns.get(1).getText()).toMatch(description);
            expect(columns.get(2).getText()).toBe(parent);
        });
    };

    beforeEach(function () {
        // login
        loginPage.visit();
		browser.waitForAngular();

        loginPage.login('usm_admin', 'password',"USM-UserManager - (no scope)");
		browser.waitForAngular();

        // select Applications from menu

        menuPage.clickApplications();
		browser.waitForAngular();

        // take the count before searching
        applicationsPage.getTableRows().count().then(function (rowCount) {
            initialApplicationsCount = rowCount;
            expect(initialApplicationsCount > 0).toBeTruthy();
        });

		browser.waitForAngular();
    });

    it('should test applications page search filters', function () {
        // set the criteria and search by application name
        applicationsPage.search("USM", "");
        testCountRowsTable();
        testRowsApplicationsTable(/USM/, /User Security Management Component/, '');
        
		// set the criteria and search by application parent name
        //applicationsPage.search("", "testJpaDaoApplicationName3");
        //testCountRowsTable();
        //testRowsApplicationsTable(/testJpa/, /Desciption for app testJpaDaoApplicationName/, 'testJpaDaoApplicationName3');
        
		// set the criteria and search by application name and application parent name
        //applicationsPage.search("test", "testJpaDaoApplicationName3");        
		//testCountRowsTable();        
		//testRowsApplicationsTable(/testJpaDaoApplicationName3_/, /Desciption for app testJpaDaoApplicationName/, 'testJpaDaoApplicationName3');
		
        applicationsPage.clickDetailButton(0);
        
		applicationsPage.getDetailSpanRole().getText().then(function(text){
            //expect(text).toMatch(/testJpaDaoApplicationName3_/);
			expect(text).toMatch(/USM/);
        });
    });

    afterEach(function () {
		loginPage.gotoHome();
	
        // logout
        menuPage.clickLogOut();

		browser.executeScript('window.sessionStorage.clear();');
		browser.executeScript('window.localStorage.clear();');		
    });
});