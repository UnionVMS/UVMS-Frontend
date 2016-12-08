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
var ApplicationsPage = function () {
    var EC = protractor.ExpectedConditions;
    this.criteriaDropDowns = $$('button.dropdown-toggle');

    this.criteriaName = element(by.model('criteria.name'));
    this.criteriaParent = this.criteriaDropDowns.get(0);

    this.searchButton = element(by.css('input[type="submit"]'));
    this.resetButton = element(by.css('[ng-click="resetForm()"]'));

    this.detailsSpanApplication = element(by.binding('applicationDetails.name'));

    this.visit = function () {
        browser.get('#/usm/applications');
        browser.wait(EC.elementToBeClickable(this.criteriaName), 10000);
    };

    this.setCriteriaName = function (name) {
        this.criteriaName.clear();
        this.criteriaName.sendKeys(name);
    };

    this.setCriteriaParent = function (parent) {
        //this.criteriaParent.sendKeys(parent);
        browser.wait(EC.elementToBeClickable(this.criteriaParent), 2100);
        this.criteriaParent.click().then(function() {
            browser.wait(EC.elementToBeClickable(element(by.linkText(parent))), 10000);
            element(by.model('criteria.parent')).all(by.linkText(parent)).click().then(function(){
                browser.waitForAngular();
            });
        });
    };

    //TABLE methods and elements
    this.applicationsTableRows = $$('.table tbody tr');

    this.setCriteria = function (name, parent) {
        this.setCriteriaName(name);
        if (parent != null && parent != "") {
            this.setCriteriaParent(parent);
        }
    };

    this.clickSearchButton = function () {
        this.searchButton.click();
    };

    this.clickResetButton = function () {
        this.resetButton.click();
    };

    this.search = function (name, parent) {
        this.setCriteria(name, parent);
        this.clickSearchButton();
    };

    this.getTableRows = function () {
        return this.applicationsTableRows;
    };

    this.getDetailButton = function(rowIndex) {
        return this.getTableRows().get(rowIndex).$$('td button');
    };

    this.clickDetailButton = function(rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button').click();
        browser.wait(EC.visibilityOf(this.detailsSpanApplication), 10000);
    };

    this.getDetailSpanRole = function(){
        return this.detailsSpanApplication;
    };

};
module.exports = ApplicationsPage;