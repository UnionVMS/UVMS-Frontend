
var LoginPage = require('../../../shared/e2e/loginPage');
var MenuPage = require('../../../shared/e2e/menuPage');

describe('setMyPasswordModalInstanceCtrl', function() {
    var menuPage = new MenuPage();
    var loginPage = new LoginPage();

    beforeEach(function ()  {
        // login as administrator
        loginPage.visit();
        loginPage.login('testUser', 'password12!@');

        // select users from menu
         menuPage.clickChangePassword();
    });

    it('should test amend user password', function () {

        //To create a random name
        var passwordRandom = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);

        passwordRandom = passwordRandom + '/*' + '24';

        //Test 1. Same fields, but less than 8 characters
        menuPage.informSetPasswordPanel('password12!@','pas*1','pas*1');
        menuPage.clickSaveButton();
        expect(menuPage.getPanelMessage()).toEqual('Error: Password must contain at least 8 characters');

        //Test 2. Successful password
        menuPage.informSetPasswordPanel('password12!@',passwordRandom,passwordRandom);
        menuPage.clickSaveButton();

        // set 2 more times new password in order to overcome the minHistory policy
        var previousPassword = passwordRandom;
        for(var i = 0 ; i < 2 ; i++){
            console.log(previousPassword);
            menuPage.clickChangePassword();
            menuPage.informSetPasswordPanel(previousPassword,'password12!@'+i,'password12!@'+i);
            menuPage.clickSaveButton();
            previousPassword = 'password12!@'+i;
        }

        // restore password
        menuPage.clickChangePassword();
        menuPage.informSetPasswordPanel(previousPassword,'password12!@','password12!@');
        menuPage.clickSaveButton();

    });

    afterEach(function () {

       loginPage.gotoHome();
       menuPage.clickLogOut();
       expect(loginPage.getPageUrl()).toBe('http://localhost:9001/app/#/login');
    });

});
