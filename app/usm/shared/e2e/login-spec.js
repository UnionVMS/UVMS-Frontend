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