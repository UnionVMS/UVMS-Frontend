var ApplicationsPage = function () {
    var EC = protractor.ExpectedConditions;

    this.criteriaName = element(by.model('criteria.name'));
    this.criteriaParent = element(by.model('criteria.parent'));

    this.searchButton = element(by.css('[ng-click="searchApplication(criteria)"]'));
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
        this.criteriaParent.sendKeys(parent);
    };

    //TABLE methods and elements
    this.applicationsTableRows = $$('.table tbody tr');

    this.setCriteria = function (name, parent) {
        this.setCriteriaName(name);
        this.setCriteriaParent(parent);
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
