
    var LoginPage = function () {
    var userName;
    var EC = protractor.ExpectedConditions;
    this.username = element(by.model('login.userName'));
    this.password = element(by.model('login.password'));
    this.loginButton = element(by.buttonText('Login'));
    this.loginMessage = element(by.binding('actionMessage'));
    this.visit = function () {
        browser.get('#/loginpanel');
        browser.wait(EC.elementToBeClickable(this.username), 10000);
    };
    var _contextLinkElement = function(context){
        return $('#selectableContext ul').element(by.linkText(context));
    };

    this.gotoHome = function () {
        browser.get('#/usm/home');
    };

    this.setUsername = function (username) {
        userName = username;
        this.username.clear();
        this.username.sendKeys(username);
    };

    this.setPassword = function (password) {
        this.password.clear();
        this.password.sendKeys(password);
    };

    this.clickLoginButton = function (context) {
        this.loginButton.click()
        //browser.wait(EC.or(), 5000);
        var contextLocator = $('#selectableContext');
        browser.wait(EC.or(EC.stalenessOf(this.loginButton),EC.presenceOf($(".ec-header-user li.dropdown span[ng-if=authenticated]")),
            EC.presenceOf(contextLocator),EC.visibilityOf(this.loginMessage)),5550);
        browser.isElementPresent(contextLocator).then(function (present) {
            if (present) {
                expect(context).not.toBe(null);
                _contextLinkElement(context).click();
                browser.wait(EC.presenceOf($(".ec-header-user li.dropdown span[ng-if=authenticated]")),7200);
                expect($(".ec-header-user li.dropdown span[ng-if=authenticated]").getText()).toBe("("+userName+")");
            }

        });
        browser.isElementPresent(this.loginMessage).then(function (present) {
            if (!present) {
                browser.wait(EC.presenceOf($(".ec-header-user li.dropdown span[ng-if=authenticated]")), 6500);
                expect($(".ec-header-user li.dropdown span[ng-if=authenticated]").getText()).toBe("("+userName+")");
            }
        });

    };

    this.getLoginMessage = function () {
        return this.loginMessage.getText();
    };

    this.getPageUrl = function () {
        return browser.getCurrentUrl();
    };

    this.login = function (username, password,context) {
        this.setUsername(username);
        this.setPassword(password);
        this.clickLoginButton(context);
    };


};
module.exports = LoginPage;
