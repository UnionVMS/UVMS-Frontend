var LoginPage = require('../../shared/e2e/loginPage');
var MenuPage = require('../../shared/e2e/menuPage');
var OrganisationsPage = require('./organisationsPage');
var OrganisationsDetailsPage = require('./organisationsDetailsPage');
var EndpointsChannelsPage = require('./endpointsChannelsPage');
var EndpointsContactsPage = require('./endpointsContactsPage');

describe('Organisations page', function () {
    var menuPage = new MenuPage();
    var loginPage = new LoginPage();
    var organisationsPage = new OrganisationsPage();
    var organisationsDetailsPage = new OrganisationsDetailsPage();

    var endpointsChannelPage = new EndpointsChannelsPage();
    var endpointsContactPage = new EndpointsContactsPage();

    var initialOrganisationsCount;
    var finalOrganisationsCount;

    var ORGANISATIONS_DETAILS_PAGE = '#/usm/organisations/';
    var LOGIN_PAGE = '#/login';
    var E = 'Enable';
    var orgTestName = "protractorOrg";
    var orgTestUpdatedName = "protractorUpdatedOrg";

    var testRowsOrganisationsTable = function (parent, organisation, description, nation) {
        organisationsPage.getTableRows().each(function (row) {
            var columns = row.$$('td');
            expect(columns.get(0).getText()).toBe(parent);
            expect(columns.get(1).getText()).toBe(organisation);
            expect(columns.get(2).getText()).toBe(description);
            expect(columns.get(3).getText()).toBe(nation);
        });
    };


    var testCountRowsTable = function () {
        organisationsPage.getTableRows().count().then(function (rowCount) {
            finalOrganisationsCount = rowCount;
            // check the new count to be less equal to the inital one
            expect(finalOrganisationsCount <= initialOrganisationsCount).toBeTruthy();
        });

    };

    beforeEach(function () {
        // login
        loginPage.visit();
        loginPage.login('usm_admin', 'password');
        // select Organisations from menu
        menuPage.clickOrganisations();

        // take the count before searching
        organisationsPage.getTableRows().count().then(function (rowCount) {
            initialOrganisationsCount = rowCount;
            expect(initialOrganisationsCount > 0).toBeTruthy();
        });
    });

    it('Test1 - should test organisations page', function () {
        // set the criteria and search
        var FRA = 'FRA';

        organisationsPage.search(FRA, FRA, E);

        // take the count after searching
        testCountRowsTable(organisationsPage);

        // check the content of the serch results
        testRowsOrganisationsTable('', FRA, 'French ministry of agriculture', FRA);

    });

    it('Test2 - should test organisations details page search filters', function () {

        var GRC = 'GRC';
        var GRC_DESCRIPTION = 'Greek ministry of agriculture';
        // set the criteria and search
        organisationsPage.search(GRC, GRC, E);

        // take the count after searching
        testCountRowsTable(organisationsPage);

        // check the content of the search results
        testRowsOrganisationsTable('', GRC, GRC_DESCRIPTION, GRC);
        var testOrg = organisationsPage.getOrganisationByName(GRC);
        var desc = testOrg.then(function(el){
            return el.element(by.binding('organisation.description')).getText();
        });
        expect(desc).toBe(GRC_DESCRIPTION);
        //organisationsPage.getViewDetailsButton(GRC).click();
        organisationsPage.viewOrganisationDetails(GRC);
        //browser.pause();
        //organisationsPage.clickDetailViewButton(0);
        //inspect that the page is Organisations Details
        //expect(organisationsDetailsPage.getPageUrl()).toBe(browser.baseUrl +ORGANISATIONS_DETAILS_PAGE);

        organisationsDetailsPage.getTableRows().each(function (row) {
            var columns = row.$$('td');
            expect(columns.get(0).getText()).toMatch(/FLUX.GRC/);
            expect(columns.get(1).getText()).toMatch(/FLUX node for Greece/);
            expect(columns.get(2).getText()).toMatch(/.flux.gr/);
        });

        //inspect that the page is End Points Details
        organisationsDetailsPage.clickDetailViewButton(1);


        //inspect that the page is Endpoints
        //expect(organisationsDetailsPage.getPageUrl()).toMatch(/endpoint/);


    });

    it('Test3 - should test create organisation', function () {
        organisationsPage.clickNewOrgButton();

        organisationsPage.setOrgName(orgTestName);
        organisationsPage.setOrgDescription("new org description");
        organisationsPage.setOrgNation("EEC");
        organisationsPage.setOrgStatus("Enabled");
        //organisationsPage.setOrgParent("EC");
        organisationsPage.setOrgEmail("newOrg@email.com");

        organisationsPage.clickManageOrgSaveButton();

        organisationsPage.refreshPage();
        organisationsPage.search(orgTestName, "EEC", "Enabled");
        testRowsOrganisationsTable('', orgTestName, "new org description", "EEC");

    });

    it('Test4 - should test edit organisation', function () {
        organisationsPage.search(orgTestName, "EEC", "Enabled");
        testRowsOrganisationsTable('', orgTestName, "new org description", "EEC");

        organisationsPage.clickRowEditButton(0);

        organisationsPage.setOrgName(orgTestUpdatedName);

        organisationsPage.clickManageOrgSaveButton();

        organisationsPage.refreshPage();
        organisationsPage.search(orgTestUpdatedName, "EEC", "Enabled");
        testRowsOrganisationsTable('', orgTestUpdatedName, "new org description", "EEC");

    });

    it('Test5 - should test delete organisation', function () {
        organisationsPage.search(orgTestUpdatedName, "EEC", "Enabled");
        testRowsOrganisationsTable('', orgTestUpdatedName, "new org description", "EEC");

        organisationsPage.clickRowDeleteButton(0);

        organisationsPage.clickManageOrgDeleteButton();
        organisationsPage.clickManageOrgConfirmButton();

        organisationsPage.refreshPage();
        organisationsPage.search(orgTestUpdatedName, "EEC", "Enabled");
        organisationsDetailsPage.getTableRows().each(function (row) {
            var columns = row.$$('td');
            expect(columns.get(0).getText()).toBe('No results found.');
        });

    });

    it('Test6 - should test create new channel', function () {
        var ORG_NAME = 'FRA';
        var ORG_DESC = 'French ministry of agriculture';
        var NAT_NAME = 'FRA';

        // set the criteria and search
        organisationsPage.search(ORG_NAME, NAT_NAME, E);

        // take the count after searching
        testCountRowsTable(organisationsPage);

        // check the content of the serch results
        testRowsOrganisationsTable('', ORG_NAME, ORG_DESC, NAT_NAME);

        organisationsPage.clickDetailViewButton(0);
        //inspect that the page is Organisations Details
       // expect(organisationsDetailsPage.getPageUrl()).toBe(browser.baseUrl +ORGANISATIONS_DETAILS_PAGE);



        //inspect that the page is End Points Details
        organisationsDetailsPage.clickDetailViewButton(1);

        //inspect that the page is Endpoints
       // expect(organisationsDetailsPage.getPageUrl()).toMatch(/endpoint/);

        endpointsChannelPage.clickNewChannelButton();

        endpointsChannelPage.setDataflow("new test dataflow");
        endpointsChannelPage.setService("new test service");
        endpointsChannelPage.setPriority("10");

        endpointsChannelPage.clickManageChannelSaveButton();
    });

    it('Test7 - should test edit channel', function () {
        var ORG_NAME = 'FRA';
        var ORG_DESC = 'French ministry of agriculture';
        var NAT_NAME = 'FRA';

        // set the criteria and search
        organisationsPage.search(ORG_NAME, NAT_NAME, E);

        // take the count after searching
        testCountRowsTable(organisationsPage);

        // check the content of the serch results
        testRowsOrganisationsTable('', ORG_NAME, ORG_DESC, NAT_NAME);

        organisationsPage.clickDetailViewButton(0);
        //inspect that the page is Organisations Details
       // expect(organisationsDetailsPage.getPageUrl()).toBe(browser.baseUrl +ORGANISATIONS_DETAILS_PAGE);

        //inspect that the page is End Points Details
        organisationsDetailsPage.clickDetailViewButton(1);

        //inspect that the page is Endpoints
        //expect(organisationsDetailsPage.getPageUrl()).toMatch(/endpoint/);

        endpointsChannelPage.clickEditChannelButton();

        endpointsChannelPage.setDataflow(" mod");
        endpointsChannelPage.setService(" mod");
        endpointsChannelPage.setPriority("99");

        endpointsChannelPage.clickManageChannelSaveButton();
    });

    it('Test8 - should test delete channel', function () {
        var ORG_NAME = 'FRA';
        var ORG_DESC = 'French ministry of agriculture';
        var NAT_NAME = 'FRA';

        // set the criteria and search
        organisationsPage.search(ORG_NAME, NAT_NAME, E);

        // take the count after searching
        testCountRowsTable(organisationsPage);

        // check the content of the serch results
        testRowsOrganisationsTable('', ORG_NAME, ORG_DESC, NAT_NAME);

        organisationsPage.clickDetailViewButton(0);
        //inspect that the page is Organisations Details
        //expect(organisationsDetailsPage.getPageUrl()).toBe(browser.baseUrl +ORGANISATIONS_DETAILS_PAGE);

        //inspect that the page is End Points Details
        organisationsDetailsPage.clickDetailViewButton(1);

        //inspect that the page is Endpoints
      //  expect(organisationsDetailsPage.getPageUrl()).toMatch(/endpoint/);

        endpointsChannelPage.clickDeleteChannelButton();

        endpointsChannelPage.clickManageChannelDelButton();

        endpointsChannelPage.clickManageChannelConfirmButton();
    });

    it('Test9 - should test create new contact', function () {
        var ORG_NAME = 'FRA';
        var ORG_DESC = 'French ministry of agriculture';
        var NAT_NAME = 'FRA';

        // set the criteria and search
        organisationsPage.search(ORG_NAME, NAT_NAME, E);

        // take the count after searching
        testCountRowsTable(organisationsPage);

        // check the content of the serch results
        testRowsOrganisationsTable('', ORG_NAME, ORG_DESC, NAT_NAME);

        organisationsPage.clickDetailViewButton(0);
        //inspect that the page is Organisations Details
        //expect(organisationsDetailsPage.getPageUrl()).toBe(browser.baseUrl +ORGANISATIONS_DETAILS_PAGE);

        //inspect that the page is End Points Details
        organisationsDetailsPage.clickDetailViewButton(1);

        organisationsDetailsPage.clickContactTab();

        endpointsContactPage.clickNewContactButton();

        endpointsContactPage.clickManageContactSaveButton();
    });

    it('Test10 - should test delete contact', function () {
        var ORG_NAME = 'FRA';
        var ORG_DESC = 'French ministry of agriculture';
        var NAT_NAME = 'FRA';

        // set the criteria and search
        organisationsPage.search(ORG_NAME, NAT_NAME, E);

        // take the count after searching
        testCountRowsTable(organisationsPage);

        // check the content of the serch results
        testRowsOrganisationsTable('', ORG_NAME, ORG_DESC, NAT_NAME);

        organisationsPage.clickDetailViewButton(0);
        //inspect that the page is Organisations Details
     //   expect(organisationsDetailsPage.getPageUrl()).toBe(browser.baseUrl +ORGANISATIONS_DETAILS_PAGE);

        //inspect that the page is End Points Details
        organisationsDetailsPage.clickDetailViewButton(1);

        //inspect that the page is Endpoints
      //  expect(organisationsDetailsPage.getPageUrl()).toMatch(/endpoint/);

        organisationsDetailsPage.clickContactTab();

        endpointsContactPage.clickDeleteContactButton();

        endpointsContactPage.clickManageContactDelButton();

        endpointsContactPage.clickManageContactConfirmButton();
    });


    it('Test11 - should test create new Endpoint', function () {
        var ORG_NAME = 'FRA';
        var ORG_DESC = 'French ministry of agriculture';
        var NAT_NAME = 'FRA';

        // set the criteria and search
        organisationsPage.search(ORG_NAME, NAT_NAME, E);

        // take the count after searching
        testCountRowsTable(organisationsPage);

        // check the content of the serch results
        testRowsOrganisationsTable('', ORG_NAME, ORG_DESC, NAT_NAME);

        organisationsPage.clickDetailViewButton(0);

        //Open the panel
        organisationsDetailsPage.clickNewEndpointButton();

        //Inform the values for the new EndPoint
        organisationsDetailsPage.setName("AAA");
        organisationsDetailsPage.setDescription("Description TestNumber5");
        organisationsDetailsPage.setURI("URI test");
        organisationsDetailsPage.setEmail("aa@aa.es");
        //organisationsDetailsPage.setStatus("E");

        organisationsDetailsPage.clickManageEndpointSaveButton();

    });

    it('Test12 - should test edit an Endpoint', function () {
        var ORG_NAME = 'FRA';
        var ORG_DESC = 'French ministry of agriculture';
        var NAT_NAME = 'FRA';

        // set the criteria and search
        organisationsPage.search(ORG_NAME, NAT_NAME, E);

        // take the count after searching
        testCountRowsTable(organisationsPage);

        // check the content of the serch results
        testRowsOrganisationsTable('', ORG_NAME, ORG_DESC, NAT_NAME);

        organisationsPage.clickDetailViewButton(0);

        //inspect that the page is Endpoints
        //expect(organisationsDetailsPage.getPageUrl()).toMatch(/endpoint/);

        organisationsDetailsPage.clickEditEndpointButton();

        organisationsDetailsPage.setDescription("Description TestNumber5 Mod");
        organisationsDetailsPage.setURI("URI test Mod");

        organisationsDetailsPage.clickManageEndpointSaveButton();
    });

    it('Test13 - should test delete endpoint', function () {
        var ORG_NAME = 'FRA';
        var ORG_DESC = 'French ministry of agriculture';
        var NAT_NAME = 'FRA';

        // set the criteria and search
        organisationsPage.search(ORG_NAME, NAT_NAME, E);

        // take the count after searching
        testCountRowsTable(organisationsPage);

        // check the content of the serch results
        testRowsOrganisationsTable('', ORG_NAME, ORG_DESC, NAT_NAME);

        organisationsPage.clickDetailViewButton(0);

        organisationsDetailsPage.clickDeleteEndpointButton();

        organisationsDetailsPage.clickManageEndpointDelButton();

        organisationsDetailsPage.clickConfirmButton();
    });


    afterEach(function () {

        loginPage.gotoHome();
        // logout
        menuPage.clickLogOut();
      //  expect(loginPage.getPageUrl()).toBe(browser.baseUrl +LOGIN_PAGE);

    });
});
