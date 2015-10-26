var LoginPage = require('./loginPage');
var MenuPage = require('./menuPage');

describe('Login page', function () {

    it('should test login page invalid password', function () {
        var page = new LoginPage();
        page.visit();
        page.setUsername('vms_user_com');
        page.setPassword('wrong');
        page.clickLoginButton();
        expect(page.getLoginMessage()).toEqual('Error: Invalid crendentials');
    });

    it('should test login page invalid userName', function () {
        var page = new LoginPage();
        page.visit();
        page.setUsername('nimda_msu');
        page.setPassword('password');
        page.clickLoginButton();
        //expect(page.getPageUrl()).toBe(browser.baseUrl +'#/usm/home');
        expect(page.getLoginMessage()).toEqual('Error: Invalid crendentials');
    });

    it('should test login page valid user', function () {
        var page = new LoginPage();
        var menuPage = new MenuPage();

        page.visit();
        page.setUsername('vms_user_com');
        page.setPassword('password');
        page.clickLoginButton();
        expect(page.getPageUrl()).toBe(browser.baseUrl +'#/usm/home');

		menuPage.clickLogOut();
        expect(page.getPageUrl()).toBe(browser.baseUrl +'#/usm/logout');
    });
    afterEach(function() {
        //browser.manage().logs().get('browser').then(function(browserLog) {
        //    expect(browserLog.length).toEqual(0);
            // Uncomment to actually see the log.
            // console.log('log: ' + require('util').inspect(browserLog));
        //});
    });
});
