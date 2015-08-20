var RolesPage = function () {
    var EC = protractor.ExpectedConditions;
    this.criteriaRole = element(by.model('criteria.role'));
    this.criteriaApplication = element(by.model('criteria.application'));
    this.criteriaStatus = element(by.model('criteria.status'));
    this.searchButton = element(by.id('searchButton'));
    this.rolesTable = $$('.table');
    this.rolesTableRows = $$('.table tbody tr');
    this.detailsSpanRole = element(by.binding('roleDetails.name'));
    this.detailsSpanApplication = element(by.binding('roleDetails.application.name'));

    this.roleName='';
    this.applicationName='';
    this.selectedRoleId='';

    this.visit = function () {
        browser.get('#/roles');
        browser.wait(EC.elementToBeClickable(this.criteriaRole), 10000);
    };

    this.setCriteriaRole = function (role) {
        this.criteriaRole.clear();
        this.criteriaRole.sendKeys(role);
    };

    this.setCriteriaApplication = function (application) {
        this.criteriaApplication.click();
        this.criteriaApplication.sendKeys(application);
    };

    this.setCriteriaStatus = function (status) {
        this.criteriaStatus.click();
        this.criteriaStatus.sendKeys(status);
    };

    this.setCriteria = function(role, application, status) {
        this.setCriteriaRole(role);
        this.setCriteriaApplication(application);
        this.setCriteriaStatus(status);
    };

    this.clickSearchButton = function () {
        this.searchButton.click();
    };

    this.search = function(role, application, status) {
        this.setCriteria(role, application, status);
        this.clickSearchButton();
    };

    this.getTable = function () {
        return this.rolesTable;
    };

    this.getTableRow = function(rowIndex) {
        return this.getTableRows().get(rowIndex);
    };

    this.getTableRows = function () {
        return this.rolesTableRows;
    };

    this.getDetailButton = function(rowIndex) {
        return this.getTableRows().get(rowIndex).$$('td button');
    };

    this.clickDetailButton = function(rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button').click();
        browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };

    this.getDetailSpanRole = function(){
        return this.detailsSpanRole;
    };

    this.getDetailSpanApplication = function(){
        return this.detailsSpanApplication;
    };

    this.getPageUrl = function () {
        return browser.getCurrentUrl();
    };

    this.getRoleName = function() {
        return this.roleName;
    };

    this.setRoleName = function(roleName) {
        this.roleName = roleName;
    };

    this.getApplicationName = function() {
        return this.applicationName;
    };

    this.setApplicationName = function(applicationName) {
        this.applicationName = applicationName;
    };

    this.setSelectedRoleId = function(roleId) {
        this.selectedRoleId = roleId;
    };

    this.getSelectedRoleId = function() {
        return this.selectedRoleId;
    };

};
module.exports = RolesPage;
