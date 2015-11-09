var LoginPage = require('../../shared/e2e/loginPage');
var MenuPage = require('../../shared/e2e/menuPage');
var RolesPage = require('./rolesPage');
var Table = require('../../shared/e2e/table');

describe('Roles page', function () {
    var menuPage = new MenuPage();
    var loginPage = new LoginPage();
    var rolesPage = new RolesPage();
    var initialRolesCount;
    var finalRolesCount;

    var roleTestName = "protractorRole";
    var roleTestDescription = "protractorRoleDescription";
    var roleTestUpdatedName = "protractorUpdatedOrg";

    var rolesTable = new Table();

    beforeEach(function () {
        // login
        loginPage.visit();
        loginPage.login('usm_admin', 'password',"USM-UserManager - (no scope)");

        // select roles from menu
        menuPage.clickRoles();

        // take the count before searching
        rolesPage.getTableRows().count().then(function (rowCount) {
            initialRolesCount = rowCount;
            expect(initialRolesCount > 0).toBeTruthy();
        });
    });

    var testRowsRoleTable = function (name, description, status) {
        rolesPage.getTableRows().each(function (row) {
            var columns = row.$$('td');

            expect(columns.get(0).getText() == 'No results found.').toBeFalsy();

            expect(columns.get(0).getText()).toBe(name);
            expect(columns.get(1).getText()).toBe(description);
            expect(columns.get(2).getText()).toBe(status);
        });
    };


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

        //rolesPage.getDetailSpanRole().getText().then(function(text){
        //    expect(text).toBe(rolesPage.getRoleName());
        //});

        //rolesPage.getDetailSpanApplication().getText().then(function(text){
        //    expect(text).toBe(rolesPage.getApplicationName());
        //});

        //rolesPage.getPageUrl().then(function(text){
        //    //var expectedUrl = browser.baseUrl + "#/usm/roles/" + rolesPage.getSelectedRoleId();
        //    //expect(text).toBe(expectedUrl);
        //});

    });

    it('Test3 - should test create role', function () {
        rolesPage.clickNewRoleButton();

        rolesPage.setRoleName(roleTestName);
        rolesPage.setRoleDescription(roleTestDescription);

        rolesPage.clickManageRoleSaveButton();

        rolesPage.refreshPage();
        rolesPage.search(roleTestName, null, "Enabled");

        testRowsRoleTable(roleTestName, roleTestDescription, "Enabled");

    });

    it('Test4 - should test edit organisation', function () {
        rolesPage.search(roleTestName, null, "Enabled");
        testRowsRoleTable(roleTestName, roleTestDescription, "Enabled");

        rolesTable.clickRowEditButton(0);

        rolesPage.setRoleName(roleTestUpdatedName);

        rolesPage.clickManageRoleSaveButton();

        rolesPage.refreshPage();
        rolesPage.search(roleTestUpdatedName, null, "Enabled");

        testRowsRoleTable(roleTestUpdatedName, roleTestDescription, "Enabled");

    });

    it('Test5 - should test delete organisation', function () {
        rolesPage.search(roleTestUpdatedName, null, "Enabled");
        testRowsRoleTable(roleTestUpdatedName, roleTestDescription, "Enabled");

        rolesPage.clickRowDeleteButton(0);

        rolesPage.clickManageRoleDeleteButton();
        // rolesPage.clickManageRoleConfirmButton();

        rolesPage.refreshPage();
        rolesPage.search(roleTestUpdatedName, null, "Enabled");

        rolesPage.getTableRows().each(function (row) {
            var columns = row.$$('td');
            expect(columns.get(0).getText() == roleTestUpdatedName).toBeFalsy();
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
