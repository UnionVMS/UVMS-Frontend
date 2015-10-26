var EndpointsContactsPage = function () {
    var EC = protractor.ExpectedConditions;

    //PANEL OF END POINTS DETAILS
    //Elements
    this.newContactButton = element(by.id('newOrgContact'));
    this.delContactButton = element.all(by.id('delOrgContact')).get(0);

    this.manageContactSaveButton = element(by.buttonText("Save"));
    this.manageContactDeleteButton = element(by.buttonText("Delete"));
    this.manageContactConfirmButton = element(by.buttonText("Confirm"));

    //Get Elements
    this.getNewContactButton = function(){
        return this.newContactButton;
    };
    this.getDeleteContactButton = function(){
        return this.delContactButton;
    };

    //PAGE management
    this.clickManageContactSaveButton = function () {
        this.manageContactSaveButton.click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };

    this.clickManageContactDelButton = function () {
        this.manageContactDeleteButton.click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('Confirm')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };

    this.clickManageContactConfirmButton = function () {
        this.manageContactConfirmButton.click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.buttonText('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };

    this.clickNewContactButton = function () {
        this.getNewContactButton().click();
    };
    this.clickDeleteContactButton = function () {
        this.getDeleteContactButton().click();
    };
    this.visit = function () {
        browser.get('#/usm/organisations');
        //browser.wait(EC.visibilityOf(this.detailsName), 10000);
    };
    this.getPageUrl = function () {
        return browser.getCurrentUrl();
    };
    this.refreshPage = function () {
        return browser.navigate().refresh();
    };
};
module.exports =
    EndpointsContactsPage;
