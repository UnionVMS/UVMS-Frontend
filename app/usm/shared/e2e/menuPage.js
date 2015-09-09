var MenuPage = function () {
    var EC = protractor.ExpectedConditions;
    this.home = element.all(by.css('.navbar .nav')).$$('.glyphicon.glyphicon-home');
    this.users = element.all(by.css('.navbar .nav')).all(by.linkText("Users"));
    this.roles = element.all(by.css('.navbar .nav')).all(by.linkText("Roles"));
    this.organisations = element.all(by.css('.navbar .nav')).all(by.linkText("Organisations"));
    this.scopes = element.all(by.css('.navbar .nav')).all(by.linkText("Scopes"));
    this.applications = element.all(by.css('.navbar .nav')).all(by.linkText("Applications"));
    this.userDropDown = element(by.id('header')).element(by.css('ul li:last-child.dropdown'));
    this.logOut = this.userDropDown.element(by.linkText("Log out"));
    this.username = element(by.model('login.userName'));
    this.changePassword = this.userDropDown.element(by.linkText("Change Password"));

    //Variables panel Set User Password
    this.currentPassword = element(by.id('currentPassword'));
    this.newPassword = element(by.model('passwordData.newPassword'));
    this.confirmPassword = element(by.model('passwordData.confirmPassword'));
    //Buttons panel
    this.saveButton = element(by.buttonText('Save')); //Save button from the panel
    this.cancelButton = element(by.buttonText('Cancel'));
    //Message panel
    this.setPasswordPanelMessage = element(by.binding('actionMessage'));

    //Variables panel Select User Context
    //button Cancel
    this.cancelButtonSelectUserContext = element(by.buttonText('Cancel'));

    this.clickCancelButtonSelectUserContext = function () {
        browser.wait(EC.elementToBeClickable(this.cancelButtonSelectUserContext), 10000);
        this.cancelButtonSelectUserContext.click();
    };

   /* this.selectSelectUserContext = element.all(by.repeater('item in selectableContexts')).get(1).
        element(by.linkText('USM-UserManager - (no scope)'));*/

    this.selectContext= function(context) {
        element.all(by.css('div .modal-dialog ul li')).all(by.linkText(context)).click();
    }

    this.clickSelectContext = function(context) {
    	this.selectContext(context).click();
       // browser.wait(EC.visibilityOf(this.contextUserTab), 10000);
    };

    //end panel Select User Context

    this.clickHome = function () {
        this.home.click();
    };
    this.clickUsers = function () {
        this.users.click();
    };
    this.clickOrganisations = function () {
        this.organisations.click();
    };
    this.clickRoles = function () {
        this.roles.click();
    };
    this.clickScopes = function () {
        this.scopes.click();
    };
    this.clickApplications = function () {
        this.applications.click();
    };
    this.clickLogOut = function () {
        this.userDropDown.click();
        browser.wait(EC.elementToBeClickable(this.logOut), 10000);
        this.logOut.click();
        //browser.wait(EC.elementToBeClickable(this.username), 10000);
    };
    this.clickChangePassword = function () {
        this.userDropDown.click();
        browser.wait(EC.elementToBeClickable(this.changePassword), 10000);
        this.changePassword.click();
    };

    //Inform the current password field
    this.applyCurrentPassword = function (password) {
        this.currentPassword.clear();
        this.currentPassword.sendKeys(password);
    };

    //Inform the new password field
    this.applyNewPassword = function (newPassword) {
        this.newPassword.clear();
        this.newPassword.sendKeys(newPassword);
    };

    //Inform the repeated password field
    this.applyConfirmPassword = function (repeatedPassword) {
        this.confirmPassword.clear();
        this.confirmPassword.sendKeys(repeatedPassword);
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

    this.informSetPasswordPanel=function(password1,password2,password3){
        this.applyCurrentPassword(password1);
        this.applyNewPassword(password2);
        this.applyConfirmPassword(password3);
    };

    this.getPanelMessage = function () {
        return this.setPasswordPanelMessage.getText();
    };

    this.getPageUrl = function () {
        return browser.getCurrentUrl();
    };
};
module.exports = MenuPage;
