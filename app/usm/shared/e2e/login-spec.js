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
        page.setUsername('guest');
        page.setPassword('password');
        page.clickLoginButton();
        expect(page.getPageUrl()).toBe(browser.baseUrl +'#/login');
        expect(page.getLoginMessage()).toEqual('Error: Invalid crendentials');

    });


    it('should test login page valid user', function () {

        var page = new LoginPage();
        var menuPage = new MenuPage();

        page.visit();
        page.setUsername('vms_user_com');
        page.setPassword('password');
        page.clickLoginButton();
        expect(page.getPageUrl()).toBe(browser.baseUrl +'#/usm');
        menuPage.clickLogOut();
        expect(page.getPageUrl()).toBe(browser.baseUrl +'#/login');

    });

});
