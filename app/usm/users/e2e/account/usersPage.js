var usersPage = function () {

	var EC = protractor.ExpectedConditions;

    //Variables panel New User
    this.userName =  element.all(by.model('user.userName'));
    this.firstName = element.all(by.model('user.person.firstName'));
    this.lastName= element.all(by.model('user.person.lastName'));
    this.phoneNumber= element.all(by.model('user.person.phoneNumber'));
    this.email= element.all(by.model('user.person.email'));
	this.activeFrom= element.all(by.id('activeFrom'));
	this.activeTo= element.all(by.id('activeTo'));
    //this.organisation= element.all(by.id('organisationSelect'));
    this.organisation= element.all(by.model('user.organisationComplex'));
    this.status= element.all(by.model('user.status'));
  //  this.savedMessage=element.all(by.bind('message'));


    //Variables Panel User Details
    this.checkBoxConfirm = element.all(by.model('confirm'));


    //Variables to Search
    this.searchUser = element.all(by.model('search.user'));
    this.searchNation = element(by.model('search.nation'));
    this.searchOrganisation= element(by.model('search.organisation'));
    this.searchStatus =element(by.model('search.status'));

	this.openEditButton = element(by.css('[ng-click="editUser(user)"]'));

    //Buttons
    this.newUserButton = element(by.id('newUserButton'));   //to create a new user account
    this.editButton = element(by.id('editButton'));  //to allow to modify a user account
    this.saveButton = element(by.buttonText('Save'));  //to save the changes in the panel
    this.searchButton = element(by.id('submit'));     //to search a user account
   // this.viewButton =element(by.model('search.status'));
    //this.saveUserPanel = element(by.css('.btn.btn-primary.btn-sm')); //Save button from the panel
   // this.saveUserPanel = element(by.id('saveButton')); //Save button from the panel

    this.viewButton = element(by.id('viewButton'));

    //Variables of the table
    this.usersTable = $$('.table');
    this.usersTableRows = $$('.table tbody tr');
	this.usersTableResultsRows = $$('.table tbody.table-bordered tr');
	this.contextUserTab = $$('a:contains(Contexts)');

    this.clickViewButton = function() {
      //  return this.getTableRows().get(rowIndex).$$('td button');
        this.viewButton.click();
    };

    this.clickDetailButton = function(rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button#viewUser').get(0).click();
    };

	this.clickOpenEditButton = function() {
		browser.wait(EC.elementToBeClickable(this.openEditButton), 10000);
		this.openEditButton.click();
	};
	
    this.clickEditButton = function() {
        browser.wait(EC.elementToBeClickable(this.editButton), 10000);
    	this.editButton.click();
		
        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });		
    };

    this.clickSaveButton = function() {
        browser.wait(EC.elementToBeClickable(this.saveButton), 10000);

        this.saveButton.click();
		
        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });		
    };

    this.getTable = function () {
        return this.usersTable;
    };

    this.getTableRow = function(rowIndex) {
        return this.getTableRows().get(rowIndex);
    };

    this.getTableRows = function () {
        return this.usersTableRows;
    };

    this.getTableResultsRows = function () {
        return this.usersTableResultsRows;
    };

    this.getDetailButton = function(rowIndex) {
        return this.getTableRows().get(rowIndex).$$('td button');
    };

    this.clickUserViewButton = function(rowIndex) {
        this.getTableResultsRows().get(rowIndex).$$('td:last-child span:last-child button').click();
        browser.wait(EC.visibilityOf(this.contextUserTab), 10000);
    };

    this.clickUserContextMenu = function() {
        this.contextUserTab.click();
    };

    //New User button
	 this.clickNewUserButton = function () {
		 this.newUserButton.click();
    };

    //Variables to search in the main table
    //Search method
    this.clickSearchButton = function () {
		 this.searchButton.click();
    };

    this.setSearchUser = function (user) {
        this.searchUser.clear();
        this.searchUser.sendKeys(user);
    };

    this.search = function(user) {
        this.setSearchUser(user);
        this.clickSearchButton();
    };

    //Panel modify user
    this.setConfirmUser = function () {
        this.checkBoxConfirm.click();
    };

    //Panel new user
     this.setUserName = function (userName) {
        this.userName.clear();
        this.userName.sendKeys(userName);
    };

    this.setFirstName = function (firstName) {
        this.firstName.clear();
        this.firstName.sendKeys(firstName);
    };

    this.setLastName = function (lastName) {
        this.lastName.clear();
        this.lastName.sendKeys(lastName);
    };

    this.setPhoneNumber = function (phoneNumber) {
        this.phoneNumber.clear();
        this.phoneNumber.sendKeys(phoneNumber);
    };

    this.setEmail = function (email) {
        this.email.clear();
        this.email.sendKeys(email);
    };

    this.setActiveFrom = function (from) {
        this.activeFrom.clear();
        this.activeFrom.sendKeys(from);
    };

    this.setActiveTo = function (to) {
        this.activeTo.clear();
        this.activeTo.sendKeys(to);
    };

    this.setOrganisation = function (organisation) {
        this.organisation.click();
        this.organisation.sendKeys(organisation);
        this.organisation.click(); //this fixes a timing-error
    };

    this.setStatus = function (status) {
        this.status.click();
        this.status.sendKeys(status);
    };

    this.refreshPage = function () {
        return browser.navigate().refresh();
    };
	
    this.clickDetailViewButton = function(rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button').get(1).click(); //The view details button occupies the second position in the table
        //  browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };
	
	this.clickContextTab = function() {
		element(by.linkText('Contexts')).click();
	};
 };

 module.exports = usersPage;
