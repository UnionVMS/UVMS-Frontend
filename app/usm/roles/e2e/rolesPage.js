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
var RolesPage = function () {
    var EC = protractor.ExpectedConditions;
    this.criteriaDropDowns = $('button.dropdown-toggle');
    this.criteriaRole = element(by.model('criteria.role'));
    this.criteriaApplication = this.criteriaDropDowns.get(0);
    this.criteriaStatus = this.criteriaDropDowns.get(1);
    this.searchButton = element(by.id('searchButton'));
    this.newRoleButton = element(by.id('newRoleButton'));
    this.manageRoleSaveButton = element(by.buttonText("Save"));
    this.manageRoleDeleteButton = element(by.buttonText("Delete"));
    this.manageRoleConfirmButton = element(by.buttonText("Confirm"));
    this.rolesTable = $('.table');
    this.rolesTableRows = $('.table tbody tr');
    this.detailsSpanRole = element(by.binding('roleDetails.name'));
    this.detailsSpanApplication = element(by.binding('roleDetails.application.name'));

    this.roleName= element.all(by.model('role.name'));
    this.roleDescription= element.all(by.model('role.description'));
    this.applicationName='';
    this.selectedRoleId='';

    this.visit = function () {
        browser.get('#/usm/roles');
        browser.wait(EC.elementToBeClickable(this.criteriaRole), 10000);
    };

    this.setCriteriaRole = function (role) {
        this.criteriaRole.clear();
        this.criteriaRole.sendKeys(role);
    };

    this.setCriteriaApplication = function (application) {
        //this.criteriaApplication.click();
        //this.criteriaApplication.sendKeys(application);
        browser.wait(EC.elementToBeClickable(this.criteriaApplication), 2100);
        this.criteriaApplication.click().then(function() {
            browser.wait(EC.elementToBeClickable(element(by.linkText(application))), 10000);
            element(by.model('criteria.application')).all(by.linkText(application)).click().then(function(){
                browser.waitForAngular();
            });
        });
    };

    this.setCriteriaStatus = function (status) {
        //this.criteriaStatus.click();
        //this.criteriaStatus.sendKeys(status);
        browser.wait(EC.elementToBeClickable(this.criteriaStatus), 2100);
        this.criteriaStatus.click().then(function() {
            browser.wait(EC.elementToBeClickable(element(by.linkText(status))), 10000);
            element(by.model('criteria.status')).all(by.linkText(status)).click().then(function(){
                browser.waitForAngular();
            });
        });
    };

    this.setCriteria = function(role, application, status) {
        this.setCriteriaRole(role);
        if (application != null) {
        this.setCriteriaApplication(application);
        }
        if (status != null) {
        this.setCriteriaStatus(status);
        }
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
        return this.getTableRows().get(rowIndex).$('td button');
    };

    this.clickDetailButton = function(rowIndex) {
		browser.waitForAngular();

		var columns = this.getDetailButton(rowIndex);

		//this.getDetailButton(rowIndex).get(1).click();
		columns.get(1).click();

        //this.getTableRows().get(rowIndex).$('td button').click();
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
		//console.log("roleId selected: " + roleId);
        this.selectedRoleId = roleId;
    };

    this.getSelectedRoleId = function() {
        return this.selectedRoleId;
    };

    this.clickNewRoleButton = function () {
        this.newRoleButton.click();
    };

    this.setRoleName = function (name) {
        this.roleName.clear();
        this.roleName.sendKeys(name);
    };

    this.setRoleDescription = function (name) {
        this.roleDescription.clear();
        this.roleDescription.sendKeys(name);
    };

    this.clickManageRoleSaveButton = function () {
        this.manageRoleSaveButton.click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };

    this.clickRowEditButton = function (rowIndex) {
        this.getTableRows().get(rowIndex).$('td button').get(0).click(); //The edit button occupies the first position in the table
        //  browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };
    this.clickRowDeleteButton = function (rowIndex) {
        this.getTableRows().get(rowIndex).$('td button').get(2).click(); //The delete button occupies the third position in the table
        //  browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };

    this.clickManageRoleDeleteButton = function () {
        this.manageRoleDeleteButton.click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };
    this.clickManageRoleConfirmButton = function () {
        this.manageRoleConfirmButton.click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };


    this.refreshPage = function () {
        return browser.navigate().refresh();
    };
};
module.exports = RolesPage;
