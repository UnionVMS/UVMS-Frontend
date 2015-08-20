var accountDetailsPage = function () {

    var EC = protractor.ExpectedConditions;

    //Buttons
    this.setUserPasswordButton = element.all(by.buttonText('Set Password'));

    //Variables panel Set User Password
    this.password =  element.all(by.model('user.password'));
    this.confirmPassword = element.all(by.model('user.repeatPassword'));
    //Buttons panel

    this.saveButton = element(by.buttonText('Save')); //Save button from the panel
    this.cancelButton = element(by.buttonText('Cancel'));
    //Message panel
    this.setPasswordPanelMessage = element(by.binding('actionMessage'));

    //Press the button Set Password
    this.setPasswordButton = function() {
        this.setUserPasswordButton.click();
    };

    //Inform the password field
    this.setPassword = function (password) {
        this.password.clear();
        this.password.sendKeys(password);
    };

    //Inform the Confirm password field
    this.setConfirmPassword = function (confirmPassword) {
        this.confirmPassword.clear();
        this.confirmPassword.sendKeys(confirmPassword);
    };

    //Press the Save Password button
    this.savePasswordButton = function() {
        this.saveButton.click();
    };

    //Press the Cancel Password button
    this.cancelPasswordButton = function() {
        this.cancelButton.click();
    };

    this.informSetPasswordPanel=function(password1,password2){
        this.setPassword(password1);
        this.setConfirmPassword(password2);
    };

    this.getPanelMessage = function () {
        return this.setPasswordPanelMessage.getText();
    };

    this.getPageUrl = function () {
        return browser.getCurrentUrl();
    };

};

module.exports = accountDetailsPage;
