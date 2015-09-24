var LoginPage = require('../../shared/e2e/loginPage');
var MenuPage = require('../../shared/e2e/menuPage');
var RolesPage = require('./rolesPage');

describe('Roles page', function () {
    var menuPage = new MenuPage();
    var loginPage = new LoginPage();
    var rolesPage = new RolesPage();
    var initialRolesCount;
    var finalRolesCount;

    beforeEach(function () {
        // login
        loginPage.visit();
        loginPage.login('usm_admin', 'password');
		
        // select roles from menu
		menuPage.selectContext("USM-UserManager - (no scope)");
        menuPage.clickRoles();
		
        // take the count before searching
        rolesPage.getTableRows().count().then(function (rowCount) {
            initialRolesCount = rowCount;
            expect(initialRolesCount > 0).toBeTruthy();
        });
    });

    it('should test roles page search filters', function () {
        // set the criteria and search
        rolesPage.search("SM", "USM", "Enabled");

        // take the count after searching
        rolesPage.getTableRows().count().then(function (rowCount) {
            finalRolesCount = rowCount;
            // check the new count to be less equal to the inital one
            expect(finalRolesCount <= initialRolesCount).toBeTruthy();
        });

        // check the content of the serch results
        rolesPage.getTableRows().each(function (row) {
            var columns = row.$$('td');
            expect(columns.get(0).getText()).toMatch(/SM/);
            //expect(columns.get(2).getText()).toBe('USM');
            expect(columns.get(2).getText()).toBe('Enabled');
        });

    });

    it('should test roles page details', function () {
        var rowToSelect = Math.floor((Math.random() * initialRolesCount - 1) + 1);
        var columns = rolesPage.getTableRow(rowToSelect).$$('td');

        // retrieve row information and assign them in page variables for future use
        columns.get(0).getText().then(function(roleName){
			//console.log("roleName: " + roleName);
            rolesPage.setRoleName(roleName);
        });
        columns.get(2).getText().then(function(applicationName){
			//console.log("applicationName: " + applicationName);			
            rolesPage.setApplicationName(applicationName);
        });

		//console.log("rowToSelect: " + rowToSelect);
		
        rolesPage.getDetailButton(rowToSelect).getAttribute('href').then(function(href){
			//console.log(href);
            rolesPage.setSelectedRoleId(href[1].split('/')[3]);
        });

        rolesPage.clickDetailButton(rowToSelect);

        rolesPage.getDetailSpanRole().getText().then(function(text){
            expect(text).toBe(rolesPage.getRoleName());
        });

        //rolesPage.getDetailSpanApplication().getText().then(function(text){
        //    expect(text).toBe(rolesPage.getApplicationName());
        //});

        rolesPage.getPageUrl().then(function(text){
            //var expectedUrl = browser.baseUrl + "#/usm/roles/" + rolesPage.getSelectedRoleId();
            //expect(text).toBe(expectedUrl);
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
