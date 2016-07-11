/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
var LoginPage = require('../../../shared/e2e/loginPage');
var MenuPage = require('../../../shared/e2e/menuPage');
var UsersPage = require('./usersPage');
var AccountDetailsPage = require('./accountDetailsPage');


describe('User List Duplicate Profile', function() {
    var menuPage = new MenuPage();
    var loginPage = new LoginPage();
    var usersPage = new UsersPage();
    var accountDetailsPage = new AccountDetailsPage();

    var userName = '';
    //var passwordRandom = '';

    beforeEach(function ()  {
        // login
        loginPage.visit();
        loginPage.login('usm_admin', 'password',"USM-UserManager - (no scope)");

        // select users from menu
        menuPage.clickUsers();

        usersPage.getTableRows().count().then(function (rowCount) {
            initialUsersCount = rowCount;
            expect(initialUsersCount > 0).toBeTruthy();
        });
    });

    it('should test copying a context from a user to another', function () {

        userName='vms_user_fra';

        //To create a random name
        //passwordRandom = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
        //passwordRandom = passwordRandom + '/*' + '24';
		//element.all(by.css('.navbar .nav')).all(by.linkText("Users")).click();
		//$('.navbar .nav').findElement(by.linkText('Users'));

		menuPage.clickUsers();

        usersPage.search(userName);

		//expect(accountDetailsPage.getPageUrl()).toBe(browser.baseUrl +'#/usm/users?user='+ userName);

		usersPage.getTableRows().get(0).$$('td button').get(2).click();

		browser.waitForAngular();
		element.all(by.id('userNameSrc')).click();
		element.all(by.id('userNameSrc')).sendKeys('usm_admin');
		element.all(by.id('userNameSrc')).sendKeys(protractor.Key.ENTER);

		browser.waitForAngular();
		element(by.buttonText("Copy profile")).click();

		browser.waitForAngular();
		element(by.buttonText("Confirm")).click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });


        //inspect that the page is Account Details
        //expect(accountDetailsPage.getPageUrl()).toBe(browser.baseUrl +'#/usm/users?user='+ userName);
    });


    afterEach(function () {
        loginPage.gotoHome();

        // logout
        menuPage.clickLogOut();
        //expect(loginPage.getPageUrl()).toBe(browser.baseUrl +'#/login');
    });

});