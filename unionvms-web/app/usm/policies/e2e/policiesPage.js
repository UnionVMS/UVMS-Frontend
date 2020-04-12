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
var PoliciesPage = function () {
    var EC = protractor.ExpectedConditions;
    this.criteriaDropDowns = $$('button.dropdown-toggle');
    this.criteriaName = element(by.model('search.name'));
	this.criteriaSubject = this.criteriaDropDowns.get(0);
    this.searchButton = element(by.id('searchButton'));
    this.modalEditButton = element(by.id('editButton')); //ng-click="editPolicy(policy)
    this.modalPolicyValue= element(by.model('policy.value'));
    this.modalSaveButton = element(by.buttonText('Save'));
    this.policiesTable = $$('.table');
    this.policiesTableRows = $$('.table tbody tr');
    this.policiesTableResultsRows = $$('.table tbody.table-bordered tr');


    this.policyName='';
    this.selectedPolicyId='';

    this.visit = function () {
        browser.get('#/usm/policies');
        browser.wait(EC.elementToBeClickable(this.criteriaName), 10000);
    };

    this.setCriteriaName = function (name) {
        this.criteriaName.clear();
        this.criteriaName.sendKeys(name);
    };

    this.setCriteriaSubject = function (subj) {
        //this.criteriaSubject.click();
        //this.criteriaSubject.sendKeys(subj);
        browser.wait(EC.elementToBeClickable(this.criteriaSubject), 2100);
        this.criteriaSubject.click().then(function() {
            browser.wait(EC.elementToBeClickable(element(by.linkText(subj))), 10000);
            element(by.model('policySubjSelected')).all(by.linkText(subj)).click().then(function(){
                browser.waitForAngular();
            });
        });
    };

    this.setCriteria = function(name, subject) {
        this.setCriteriaName(name);
        if (subject != null) {
            this.setCriteriaSubject(subject);
        }
    };

    this.clickSearchButton = function () {
        this.searchButton.click();
    };

    this.search = function(name, subject) {
        this.setCriteria(name, subject);
        this.clickSearchButton();
    };

    this.getTable = function () {
        return this.policiesTable;
    };

    this.getTableRow = function(rowIndex) {
        return this.getTableRows().get(rowIndex);
    };

    this.getTableRows = function () {
        return this.policiesTableRows;
    };

	this.getTableResultsRows = function () {
		return this.policiesTableResultsRows;
	};

    this.getDetailButton = function(rowIndex) {
		return this.getTableResultsRows().get(rowIndex).$$('td button');
    };

    this.clickDetailButton = function(rowIndex) {
        this.getDetailButton(rowIndex).click();
    };

    this.getPageUrl = function () {
        return browser.getCurrentUrl();
    };

    this.getPolicyName = function() {
        return this.policyName;
    };

    this.setPolicyName = function(policyName) {
        this.policyName = policyName;
    };

    this.setSelectedPolicyId = function(policyId) {
        this.selectedPolicyId = policyId;
    };

    this.getSelectedPolicyId = function() {
        return this.selectedPolicyId;
    };

    this.clickModalEditButton = function () {
        this.modalEditButton.click();
    };

    this.clickModalSaveButton = function () {
        this.modalSaveButton.click();
    };

    this.setModalPolicyValue = function (value) {
        this.modalPolicyValue.clear();
        this.modalPolicyValue.sendKeys(value);
    };
};
module.exports = PoliciesPage;