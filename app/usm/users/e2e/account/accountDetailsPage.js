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