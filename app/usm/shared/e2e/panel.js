var Panel = function () {
	var EC = protractor.ExpectedConditions;

    //Buttons panel
    this.saveButton = element(by.buttonText('Save')); //Save button from the panel
    this.cancelButton = element(by.buttonText('Cancel'));
    this.resetButton = element(by.buttonText('Reset password'));

    //Title of the panel
    // this.titlePanel = element.all(by.css('.modal-header .modal-title'));
    //this.titlePanel = element(by.css('.modal-header h3'));

    this.getTitlePanel = function (idPanel) {
        if (idPanel === undefined){
            return element(by.css('.modal-header h3')).getText();
        }else{
            return element(by.id(idPanel)).element(by.css('.modal-header h3')).getText();
        }
    };

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

    //Press the Save Password button
    this.waitPanel = function() {
    //    browser.wait(EC.elementToBeVisible(this.resetButton ), 10000); buscar opcion de ver panel
        this.resetButton.click();
    };

    //Variable for the Password
    this.currentPassword = element(by.id('currentPassword'));
    this.userPassword = element(by.id('userPassword'));
    this.repeatPassword = element(by.id('repeatPassword'));

    //Inform the current password field
    this.applyCurrentPassword = function (password) {
        this.currentPassword.click();
        this.currentPassword.clear();
        this.currentPassword.sendKeys(password);
    };

    //Inform the user password field
    this.applyUserPassword = function (password) {
        this.userPassword.click();
        this.userPassword.clear();
        this.userPassword.sendKeys(password);
    };

    //Inform the repeat password field
    this.applyRepeatPassword = function (password) {
        this.repeatPassword.click();
        this.repeatPassword.clear();
        this.repeatPassword.sendKeys(password);
    };

    //Message panel
    //this.setPanelMessage = element(by.binding('actionMessage'));
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

    //Press the Save Password button
    this.clickResetButton = function() {
        browser.wait(EC.elementToBeClickable(this.resetButton), 10000);
        this.resetButton.click();
    };

    this.clickResetButtonSuccess = function() {
        browser.wait(EC.elementToBeClickable(this.resetButton), 10000);
        this.resetButton.click();

        browser.wait(function() {
            deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };


    this.getPanelMessage = function (idPanel) {
        if (idPanel === undefined){
           return element(by.binding('actionMessage')).getText();
        }else{
           return element(by.id(idPanel)).all(by.binding('actionMessage')).getText();

        }
     };

    this.getLabelText = function (idPanel,index) {
        if (idPanel === undefined){
            return element.all(by.tagName('label')).get(index).getText();
        }else{
            return element(by.id(idPanel)).all(by.tagName('label')).get(index).getText();
        } 
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

};
module.exports = Panel;
