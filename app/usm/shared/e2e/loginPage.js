var LoginPage = function () {
    var EC = protractor.ExpectedConditions;
    this.username = element(by.model('login.userName'));
    this.password = element(by.model('login.password'));
    this.loginButton = element(by.buttonText('Login'));
    this.loginMessage = element(by.binding('actionMessage'));
    this.visit = function () {
        browser.get('#/usm');
        browser.wait(EC.elementToBeClickable(this.username), 10000);
    };

    this.gotoHome = function () {
		browser.get('#/usm');
	};

    this.setUsername = function (username) {
        this.username.clear();
        this.username.sendKeys(username);
    };

    this.setPassword = function (password) {
        this.password.clear();
        this.password.sendKeys(password);
    };

    this.clickLoginButton = function () {
        this.loginButton.click();
    };
    this.getLoginMessage = function () {
        return this.loginMessage.getText();
    };

    this.getPageUrl = function () {
      return browser.getCurrentUrl();
    };

    this.login = function(username, password) {
        this.setUsername(username);
        this.setPassword(password);
        this.clickLoginButton();
    }
};
module.exports = LoginPage;
