var LoginPage = require('../../../shared/e2e/loginPage');
var MenuPage = require('../../../shared/e2e/menuPage');
var UsersPage = require('./usersPage');


describe('Test manage user', function() {
	var menuPage = new MenuPage();
    var loginPage = new LoginPage();
    var usersPage = new UsersPage();
    var initialUsersCount=0;

    var userName = '';
    var today = new Date();


    beforeEach(function () {
        // login
        loginPage.visit();
        loginPage.login('usm_admin', 'password',"USM-UserManager - (no scope)");

        // select users from menu
        menuPage.clickUsers();

        usersPage.getTableRows().count().then(function (rowCount) {
            initialUsersCount = rowCount;
			//console.log("initialUsersCount: " + initialUsersCount);
            expect(initialUsersCount > 0).toBeTruthy();
        });

     });

	it('should test create a new user', function(){

		//To create a random name
		userName = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);

		//New User button
		usersPage.clickNewUserButton();

		//NEW USER
		//To fill out the data of the new user
		usersPage.setUserName(userName);
		usersPage.setFirstName('FirstName');
		usersPage.setLastName('LastName');
		usersPage.setStatus('Enabled');
		usersPage.setEmail('aa@aa.es');
		//usersPage.setActiveFrom('2015-09-01');
		//usersPage.setActiveTo('2025-09-01');
		usersPage.setOrganisation('FRA');
		usersPage.setPhoneNumber('99999999');

		browser.waitForAngular();

		usersPage.clickSaveButton();

		usersPage.refreshPage();

		//usersPage.getTableRows().count().then(function (rowCount) {
			//initialUsersCount = rowCount;
			//console.log("rowCount : " + rowCount);
		//	expect((rowCount-initialUsersCount) > 0).toBeTruthy();
        //});
	});

	it('should test modify a user', function(){
		usersPage.search(userName);
		usersPage.clickSearchButton();

		//To retrieve the data of the system in the format
		var dayCalculation = function() {
			var dd = today.getDate();
			var mm = today.getMonth()+1;
			var yyyy = today.getFullYear();
			if(dd<10){
				dd='0'+dd;
			};
			if(mm<10){
				mm='0'+mm;
			};
			today = yyyy+'-'+mm+'-'+dd;
		};

		dayCalculation();

		// take the count after searching
		usersPage.getTableRows().count().then(function (rowCount) {
			finalUsersCount = rowCount;
			//console.log("finalUsersCount: " + finalUsersCount);
			// check the new count to be less equal to the inital one
			expect(finalUsersCount <= initialUsersCount).toBeTruthy();
			expect(finalUsersCount==1).toBeTruthy();
		});

		// check the content of the serch results
		var columns = usersPage.getTableRow(0).$$('td');
		expect(columns.get(0).getText()).toBe(userName);
		expect(columns.get(1).getText()).toBe('FirstName');
		expect(columns.get(2).getText()).toBe('LastName');
		expect(columns.get(3).getText()).toBe('FRA');
		expect(columns.get(4).getText()).toBe('FRA');
		expect(columns.get(5).getText()).toBe(today);
		expect(columns.get(6).getText()).toBe('2999-01-01');
		expect(columns.get(7).getText()).toBe('Enabled');

		// Select the details button and open the panel
		usersPage.clickDetailButton(0);
		
		usersPage.clickOpenEditButton();
		
		usersPage.clickEditButton();
		usersPage.setPhoneNumber('21111');
		//usersPage.setOrganisation('FRA');

		usersPage.clickSaveButton();
		usersPage.refreshPage();

		//check the results whcih are visible inthe main list
		//columns = usersPage.getTableRow(0).$$('td');
		//expect(columns.get(3).getText()).toBe('FRA');
		//expect(columns.get(4).getText()).toBe('FRA');
	});


	afterEach(function () {
		loginPage.gotoHome();

		// logout
		menuPage.clickLogOut();

		browser.executeScript('window.sessionStorage.clear();');
		browser.executeScript('window.localStorage.clear();');
	});

});
