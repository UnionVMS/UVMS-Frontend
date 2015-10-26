var changesPage = function () {
    var EC = protractor.ExpectedConditions;

    this.rejectButton = element(by.buttonText('Reject'));
    this.approveButton = element(by.buttonText('Approve'));
    this.phoneNewValue= element.all(by.model('newValue.phoneNumber'));
    this.mobileNewValue= element.all(by.model('newValue.mailNumber'));
    this.faxNewValue= element.all(by.model('newValue.faxNumber'));
    this.emailNewValue= element.all(by.model('newValue.email'));

    // inputs for the update contact details modal
    this.updateContactDetailsPhone= element.all(by.model('myContactDetails.phoneNumber'));
    this.updateContactDetailsPassword= element.all(by.model('myContactDetails.currentPassword'));
    this.updateContactDetailsSaveButton = element(by.css('[value="Save"]'));

    //Variables of the table
    this.changesTable = $$('.table');
    this.changesTableRows = $$('.table tbody tr');
	
    this.changesTableResultsRows = $$('.table tbody.table-bordered tr');

    this.clickDetailButton = function(rowIndex) {
		this.getTableRow(0).$$('td button').get(0).click();
    };

    this.clickApproveButton = function() {
        this.approveButton.click();
        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });		
    };

    this.clickRejectButton = function() {
        this.rejectButton.click();
        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });		
    };

    this.getTable = function () {
        return this.changesTable;
    };

    this.getTableRows = function () {
        return this.changesTableRows;
    };

    this.getTableRow = function(rowIndex) {
        return this.getTableRows().get(rowIndex);
    };

    this.getTableRowColumns = function(rowIndex) {
        return this.getTableRows().get(rowIndex).$$('td');
    };

    this.getTableRowColumn = function(rowIndex, columnIndex) {
        return this.getTableRows().get(rowIndex).$$('td').get(columnIndex);
    };

    this.getTableResultsRows = function () {
        return this.changesTableResultsRows;
    };

    this.getDetailButton = function(rowIndex) {
        return this.getTableRows().get(rowIndex).$$('td button');
    };

    this.setUpdateContactDetailsPassword = function (value) {
        this.updateContactDetailsPassword.clear();
        this.updateContactDetailsPassword.sendKeys(value);
    };

    this.setUpdateContactDetailsPhone = function (value) {
        this.updateContactDetailsPhone.clear();
        this.updateContactDetailsPhone.sendKeys(value);
    };
	
    this.clickUpdateContactDetailsSaveButton = function() {
        browser.wait(EC.elementToBeClickable(this.updateContactDetailsSaveButton), 10000);
        this.updateContactDetailsSaveButton.click();
        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };

};

module.exports = changesPage;
