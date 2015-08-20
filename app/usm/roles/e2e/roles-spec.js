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
        loginPage.login('usm_bootstrap', 'password');
        // select roles from menu
        menuPage.clickRoles();
        // take the count before searching
        rolesPage.getTableRows().count().then(function (rowCount) {
            initialRolesCount = rowCount;
            expect(initialRolesCount > 0).toBeTruthy();
        });
    });

    it('should test roles page serach filters', function () {
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
            expect(columns.get(2).getText()).toBe('USM');
            expect(columns.get(3).getText()).toBe('E');
        });

    });

    it('should test roles page role details', function () {
        var rowToSelect = Math.floor((Math.random() * initialRolesCount - 1) + 1);
        var columns = rolesPage.getTableRow(rowToSelect).$$('td');

        // retrieve row information and assign them in page variables for future use
        columns.get(0).getText().then(function(roleName){
            rolesPage.setRoleName(roleName);
        });
        columns.get(2).getText().then(function(applicationName){
            rolesPage.setApplicationName(applicationName);
        });

        rolesPage.getDetailButton(rowToSelect).getAttribute('href').then(function(href){
            rolesPage.setSelectedRoleId(href[0].split('/')[2]);
        });

        rolesPage.clickDetailButton(rowToSelect);

        rolesPage.getDetailSpanRole().getText().then(function(text){
            expect(text).toBe(rolesPage.getRoleName());
        });

        rolesPage.getDetailSpanApplication().getText().then(function(text){
            expect(text).toBe(rolesPage.getApplicationName());
        });

        rolesPage.getPageUrl().then(function(text){
            var expectedUrl = "#/role/" + rolesPage.getSelectedRoleId() + "/details";
            expect(text).toBe(expectedUrl);
        });

    });

    afterEach(function () {
        // logout
        menuPage.clickLogOut();
        expect(loginPage.getPageUrl()).toBe(browser.baseUrl +'#/login');
    });
});
