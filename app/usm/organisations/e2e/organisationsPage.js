var OrganisationsPage = function () {
    var EC = protractor.ExpectedConditions;

    //this.criteriaName = element(by.model('search.name'));
    this.criteriaDropDowns = $$('button.dropdown-toggle');
    this.criteriaName = this.criteriaDropDowns.get(0);
    this.criteriaNation = this.criteriaDropDowns.get(1);
    this.criteriaStatus = this.criteriaDropDowns.get(2);

    this.searchButton = element(by.id('searchButton'));
    this.resetButton = element(by.css('[ng-click="resetForm()"]'));
    this.newOrgButton = element(by.id('newOrgButton'));
    this.manageOrgSaveButton = element(by.buttonText("Save"));
    this.manageOrgDeleteButton = element(by.buttonText("Delete"));
    this.manageOrgConfirmButton = element(by.buttonText("Confirm"));
    this.orgName = element(by.model('org.name'));
    this.orgDescription = element(by.model('org.description'));
    this.orgNation = element(by.model('org.nation'));
    this.orgStatus = element(by.model('org.status'));
    this.orgParent = element(by.model('org.parent'));
    this.orgEmail = element(by.model('org.email'));

    //this.orgNationList = element.all(by.css('[id^="typeahead"]')).get(0);
	//this.orgNationList = element(by.css('[id^="typeahead"]'));

    this.visit = function () {
        browser.get('#/usm/organisations');
        browser.wait(EC.elementToBeClickable(this.criteriaName), 10000);
    };



    this.setCriteriaName = function (name) {
        //this.criteriaName.sendKeys(name);  //previous to the change of the drop-down
        browser.wait(EC.elementToBeClickable(this.criteriaName), 2100);
        this.criteriaName.click().then(function() {
            browser.wait(EC.elementToBeClickable(element(by.linkText(name))), 10000);
            element(by.linkText(name)).click().then(function(){
                browser.waitForAngular();
            });
        });

    };

    this.setCriteriaNation = function (nation) {
        //this.criteriaNation.sendKeys(nation); //previous to the change of the drop-down
        browser.wait(EC.elementToBeClickable(this.criteriaNation), 2100);
        this.criteriaNation.click().then(function() {
            browser.wait(EC.elementToBeClickable(element(by.linkText(nation))), 10000);
            element(by.model('search.nation')).all(by.linkText(nation)).click().then(function(){
                browser.waitForAngular();
            });
        });
    };

    this.setCriteriaStatus = function (status) {
        //this.criteriaStatus.sendKeys(status);
        browser.wait(EC.elementToBeClickable(this.criteriaStatus), 2100);
        this.criteriaStatus.click().then(function() {
            browser.wait(EC.elementToBeClickable(element(by.linkText(status))), 10000);
            element(by.model('search.status')).all(by.linkText(status)).click().then(function(){
                browser.waitForAngular();
            });
        });

    };

    //TABLE methods and elements
    this.organisationsTable = $$('.table');
    this.organisationsTableRows = $$('.table tbody tr');
    this.organisationsTableResultsRows = $$('.table tbody.table-bordered tr');

    this.clickDetailButton = function (rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button').click();
        //  browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };
    this.clickDetailViewButton = function (rowIndex) {
        //this.getTableRows().get(rowIndex).$$('td button').get(1).click(); //The view details button occupies the second position in the table
		var row = this.getTableRows().get(rowIndex);
		browser.waitForAngular();
		var cols = row.$$('td button');
		cols.get(1).click();
        //browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };

    this.clickRowEditButton = function (rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button').get(0).click(); //The edit button occupies the first position in the table
        //  browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };
    this.clickRowDeleteButton = function (rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button').get(2).click(); //The delete button occupies the third position in the table
        //  browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };

    //Loading message
    this.loadingMessage = $$('.table tbody.tr td');

    this.getLoadingMessage = function () {
        return this.loadingMessage.getText();
    };
    //TABLE methods and elements

    this.setCriteria = function (name, nation, status) {
        if (name != null && name != "") {
            this.setCriteriaName(name);
        }
        this.setCriteriaNation(nation);
        this.setCriteriaStatus(status);
    };

    this.clickSearchButton = function () {
        this.searchButton.click();
    };

    this.clickResetButton = function () {
        this.resetButton.click();
    };

    this.search = function (name, nation, status) {
        this.setCriteria(name, nation, status);
        this.clickSearchButton();
    };

    this.getTable = function () {
        return this.organisationsTable;
    };

    this.getTableRow = function (rowIndex) {
        return this.getTableRows().get(rowIndex);
    };

    this.getTableRows = function () {
        return this.organisationsTableRows;
    };

    this.getOrganisationsList= function(){
        //console.log('getting orgs by repeater ');
        var listPromise = element.all(by.repeater('organisation in displayedOrganisations'));
        //console.log(listPromise);
        return listPromise;
    };

    /**
     * Promise to find the first organisation matching a name in the table.
     *
     * @usage
     * var testOrg = orgsPage.getOrganisationByName('TEST');
     * var desc = testOrg.then(function(el){
     *           return el.element(by.binding('organisation.description')).getText();
     *      });
     * expect(desc).toEqual('this is the description of the test org');
     */
    this.getOrganisationByName = function(name){
        //console.log('trying to get org with name: '+name);
        //browser.pause();
        var orgsP = this.getOrganisationsList();
        var filterFn = function(elemF,index){
            //console.log('filtering for '+name+' on index '+index);
            return elemF.element(by.binding('organisation.name')).getText().then(function(text) {
                //console.log('testing '+text+' against expected '+name);
                return text == name;
            });
        };
        return orgsP.filter(filterFn).then(function(els){
            //console.log('els length '+els.length);
            //console.log(els[0]);
            if(els.length === 0)return null;
            return els[0];
        });
    };

    this.getOrganisationViewButton = function(name){
        return this.getOrganisationByName(name)
            .then(function(el){
                return el.element(by.css('td button .fa-eye'));
            });
    };

    this.viewOrganisationDetails = function(name){
        this.getOrganisationViewButton(name)
            .then(function(el){
                el.click();
            });
    };


    this.getDetailButton = function (rowIndex) {
        return this.getTableRows().get(rowIndex).$$('td button');
    };

    this.clickDetailButton = function (rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button').click();
        // browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };

    this.clickNewOrgButton = function () {
        this.newOrgButton.click();
    };
    this.clickManageOrgSaveButton = function () {
        browser.wait(EC.elementToBeClickable(this.manageOrgSaveButton), 10000);
        this.manageOrgSaveButton.click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });

    };
    this.clickManageOrgDeleteButton = function () {
        this.manageOrgDeleteButton.click();
    };
    this.clickManageOrgConfirmButton = function () {
        this.manageOrgConfirmButton.click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };
    this.setOrgName = function (name) {
        this.orgName.clear();
        this.orgName.sendKeys(name);
    };
    this.setOrgDescription = function (description) {
        this.orgDescription.sendKeys(description);
    };
    this.setOrgNation = function (nation) {
        this.orgNation.click();
        this.orgNation.sendKeys(nation);
        //this.orgNationList.click();
    };
    this.setOrgStatus = function (status) {
		this.orgStatus.click();
        this.orgStatus.sendKeys(status);
    };
    this.setOrgParent = function (parent) {
		this.orgParent.click();
        this.orgParent.sendKeys(parent);
    };
    this.setOrgEmail = function (email) {
        this.orgEmail.sendKeys(email);
    };

    //PAGE elements
    this.getPageUrl = function () {
        return browser.getCurrentUrl();
    };
    this.refreshPage = function () {
        return browser.navigate().refresh();
    };
};
module.exports = OrganisationsPage;
