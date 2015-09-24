var Panel = function () {
    var EC = protractor.ExpectedConditions;

    //Buttons panel
    this.saveButton = element(by.buttonText('Save')); //Save button from the panel
    this.cancelButton = element(by.buttonText('Cancel'));

    this.setFieldValue = function (idField,value) {
       var field = element(by.id(idField));
        field .click();
        field .clear();
        field .sendKeys(value);
    };

    this.setSelectValue = function (idSelect,value) {
       var select = element(by.id(idSelect));
        select.click();
        select.sendKeys(value);
    };

  //Variable for the Password
    this.currentPassword = element(by.id('currentPassword'));

    //Inform the current password field
    this.applyCurrentPassword = function (password) {
        this.currentPassword.click();
        this.currentPassword.clear();
        this.currentPassword.sendKeys(password);
    };

    //Message panel
    this.setPanelMessage = element(by.binding('actionMessage'));

    //Press the Save Password button
    this.clickSaveButton = function() {
        browser.wait(EC.elementToBeClickable(this.saveButton), 10000);
        this.saveButton.click();
    };

  //Press the Save Password button with success
    this.clickSaveButtonSuccess = function() {
        var deferred = '';

        browser.wait(EC.elementToBeClickable(this.saveButton), 10000);
        this.saveButton.click();

        browser.wait(function() {
            deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };

    this.getPanelMessage = function () {
        return this.setPanelMessage.getText();
    };

    //Press the Save Password button
    this.clickSaveButton = function() {
        browser.wait(EC.elementToBeClickable(this.saveButton), 10000);
        this.saveButton.click();
    };

    //Press the Cancel Password button
    this.clickCancelButton = function() {
        this.cancelButton.click();
    };

  //Press the Cancel Password button
    this.clickCancelButton = function() {
        this.cancelButton.click();
    };

};
module.exports = Panel;