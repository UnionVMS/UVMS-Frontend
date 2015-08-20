var usersPage = function () {

	var EC = protractor.ExpectedConditions;

    //Variables panel New User
    this.userName =  element.all(by.model('user.userName'));
    this.firstName = element.all(by.model('user.firstName'));
    this.lastName= element.all(by.model('user.lastName'));
    this.phoneNumber= element.all(by.model('user.phoneNumber'));
    this.email= element.all(by.model('user.email'));
    this.organization= element.all(by.model('user.organisationName'));
    this.status= element.all(by.model('user.status'));


    //Variables Panel User Details
    //this.userNameMod =  element.all(by.model('user.userName'));
    this.firstNameMod = element.all(by.model('user.firstName'));
    this.lastNameMod = element.all(by.model('user.lastName'));
    this.phoneNumberMod = element.all(by.model('user.contactDetails.phoneNumber'));
    this.organizationMod = element.all(by.model('user.organisation.organisationName'));
    this.emailMod = element.all(by.model('user.email'));
    this.checkBoxConfirm = element.all(by.model('confirm'));


    //Variables to Search
    this.searchUser = element.all(by.model('search.user'));
    this.searchNation = element(by.model('search.nation'));
    this.searchOrganisation= element(by.model('search.organisation'));
    this.searchStatus =element(by.model('search.status'));


    //Buttons
    this.newUserButton = element(by.css('[ng-click="addNewUser()"]'));   //to create a new user account
    this.editButton = element(by.css('[ng-click="changeEditForm()"]'));  //to allow to modify a user account
    this.SaveButton = element(by.buttonText('Save'));  //to save the changes in the panel
    this.searchButton = element(by.id('submit'));     //to search a user account
   // this.viewButton =element(by.model('search.status'));
    this.saveUserPanel = element(by.css('.btn.btn-primary.btn-sm')); //Save button from the panel
    this.saveUserPanelcheck = element(by.css('.btn.btn-primary.btn-sm.fa.fa-check')); //Save button from the panel

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
        this.getTableRows().get(rowIndex).$$('td button').click();
      //  browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };

    this.clickEditButton = function(rowIndex) {
    	element(by.css('[ng-click="changeEditForm()"]')).click();
    };

    this.clickSaveButtonUser = function() {
        this.saveUserPanel.click();
    };

   // this.clickSaveButton = function() {
    //	this.SaveButton.click();

    this.clickSaveButton = function() {
        this.saveUserPanelcheck.click();
    };

    this.clickDetailButtonTest = function(rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button').click();
      //  browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };

    this.getTable = function () {
        return this.usersTable;
    };

    this.getTableRow = function(rowIndex) {
        return this.getTableRows().get(rowIndex);
    };

    this.getTableRowColumn = function(columnIndex) {
        return this.getTableRows().get(rowIndex).$$('td');
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

    this.clickDetailButton = function(rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button').click();
        //  browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
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
    this.setPhoneNumberMod = function (phoneNumberMod) {
        this.phoneNumberMod.clear();
        this.phoneNumberMod.sendKeys(phoneNumberMod);
    };

    this.setOrganizationMod = function (organizationMod) {
    	this.organizationMod.click();
    	this.organizationMod.sendKeys(organizationMod);
    };

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

    this.setOrganization = function (organization) {
        this.organization.click();
        this.organization.sendKeys(organization);
    };

    this.setStatus = function (status) {
        this.status.click();
        this.status.sendKeys(status);
    };

    };

 module.exports = usersPage;
