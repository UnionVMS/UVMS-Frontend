var OrganisationsDetailsPage = function () {
    var EC = protractor.ExpectedConditions;

    //PANEL OF ORGANISATIONS DETAILS
    //Elements
    this.detailsName = element(by.binding('organisation.name'));
    this.detailsDescription = element(by.binding('organisation.description'));
    this.detailsNation = element(by.binding('organisation.nation'));
    this.detailsParent = element(by.binding('organisation.parent'));
    this.detailsEmail = element(by.binding('organisation.email'));
    this.detailsStatus = element(by.binding('organisation.status'));
    this.editEndpointButton = element.all(by.id('endpoint_edit'));
    this.deleteEndpointButton = element.all(by.id('endpoint_delete'));

   // this.newOrgEndpointButton = element(by.id('newOrgEndpointButton'));
    this.newEndpointButton = element(by.id('new_endpoint'));


    //Get Elements
    this.getDetailsName = function(){
        return this.detailsName;
    };
    this.getDetailsDescription = function(){
        return this.detailsDescription;
    };
    this.getDetailsNation = function(){
        return this.detailsNation;
    };
    this.getDetailsParent = function(){
        return this.detailsParent;
    };
    this.getDetailsEmail = function(){
        return this.detailsEmail;
    };
    this.getDetailsStatus = function(){
        return this.detailsStatus ;
    };

    //PANEL OF ENDPOINT MANAGEMENT
    //Title of the panel
    this.titlePanel = element.all(by.css('.modal-header .modal-title'));

    this.getTitlePanel = function(){
        return this.titlePanel;
    };

    //Elements of the panels MANAGE ENDPOINTS
    this.endName = element(by.model('endpoint.name'));
    this.endDescription = element(by.model('endpoint.description'));
    this.endURI = element(by.model('endpoint.uri'));
    this.endEmail = element(by.model('endpoint.email'));
    this.endStatus = element(by.model('endpoint.status'));

    //Inform the fields of the panel
    //Name
    this.setName = function (endName) {
        this.endName.clear();
        this.endName.sendKeys(endName);
    };
    //Description
    this.setDescription = function (endDescription) {
        this.endDescription.clear();
        this.endDescription.sendKeys(endDescription);
    };
    //URI
    this.setURI = function (endURI) {
        this.endURI.clear();
        this.endURI.sendKeys(endURI);
    };
    //Email
    this.setEmail = function (endEmail) {
        this.endEmail.clear();
        this.endEmail.sendKeys(endEmail);
    };

    //Status
    this.setStatus = function (endStatus) {
        this.endStatus.clear();
        this.endStatus.sendKeys(endStatus);
    };

    //Buttons
    this.saveButton = element(by.buttonText('Save')); //Save button from the panel
    this.cancelButton = element(by.buttonText('Cancel')); //Confirm Button in the panel
    this.manageDeleteButton = element(by.buttonText("Delete")); //Delete Button in the panel

    this.clickManageEndpointSaveButton = function () {
    	this.saveButton.click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                })
            return deferred.promise;
        });
    };


    this.clickManageEndpointDelButton = function () {
        this.getDeleteButton().click();

    };

    this.getDeleteButton = function(){
        return this.manageDeleteButton;
    };

    this.clickDeleteButton = function () {
        this.getDeleteButton().click();
    };

    this.ConfirmButton = element(by.buttonText("Confirm"));

    this.clickConfirmButton = function () {
        this.ConfirmButton.click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.buttonText('Confirm')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };

    //Message panel
    this.panelMessage = element(by.binding('actionMessage'));

    //PANEL OF ENDPOINT MANAGEMENT - END

    //TABLE methods and elements
    this.endpointTable = $$('.table');
    this.endpointTableRows = $$('.table tbody tr');
    this.endpointTableResultsRows = $$('.table tbody.table-bordered tr');

    this.clickDetailButton = function(rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button').click();
    };

    this.getTable = function () {
        return this.endpointTable;
    };

    this.getTableRow = function(rowIndex) {
        return this.getTableRows().get(rowIndex);
    };

    this.getTableRows = function () {
        return this.endpointTableRows;
    };

    this.getDetailButton = function(rowIndex) {
        return this.getTableRow(rowIndex).$$('td button');
    };

    this.clickDetailViewButton = function(rowIndex) {
		this.getTableRows().get(rowIndex).$$('td button').get(1).click(); //The view details button occupies the second position in the table		
		/*var row = this.getTableRow(rowIndex);
		browser.waitForAngular();
		var cols = row.$$('td button');
		cols.get(1).click();
		*/
        //browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };

    this.getElementTable = function(rowIndex,columnIndex) {
        this.getTableRows().get(rowIndex).$$('td').get(columnIndex).getText(); //To read the element in a position in the table
    };

    this.clickContactTab = function () {
        element(by.linkText('Contacts')).click();
    };
    this.clickNewEndpointButton = function () {
        this.newEndpointButton.click();
    };

    this.clickEditEndpointButton = function () {		
        this.getEditEndpointButton().click();
    };

    this.clickDeleteEndpointButton = function () {
        this.getDeleteEndpointButton().click();

    };

    this.getEditEndpointButton = function(){
		return this.editEndpointButton.get(0);
    };

    this.getDeleteEndpointButton = function(){
        return this.deleteEndpointButton.get(0);
    };

    //PAGE METHODS
    this.getPageUrl = function () {
        return browser.getCurrentUrl();
    };

};
module.exports = OrganisationsDetailsPage;
