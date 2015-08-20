var EndpointsChannelsPage = function () {
    var EC = protractor.ExpectedConditions;

    //PANEL OF END POINTS CHANNEL DETAILS
    //Elements
    this.newChannelButton = element(by.id('newOrgChannel'));
    this.editChannelButton = element(by.id('editOrgChannel'));
    this.delChannelButton = element(by.id('delOrgChannel'));

    this.manageChannelSaveButton = element(by.buttonText("Save"));
    this.manageChannelDeleteButton = element(by.buttonText("Delete"));
    this.manageChannelConfirmButton = element(by.buttonText("Confirm"));

    this.channelDataflow = element(by.id('dataFlow'));
    this.channelService  = element(by.id('service'));
    this.channelPriority = element(by.id('priority'));

    //Get Elements
    this.getNewChannelButton = function(){
        return this.newChannelButton;
    };
    this.getEditChannelButton = function(){
        return this.editChannelButton;
    };
    this.getDeleteChannelButton = function(){
        return this.delChannelButton;
    };

    this.getDataflow = function(){
        return this.channelDataflow;
    };
    this.getService = function(){
        return this.channelService;
    };
    this.getPriority = function(){
        return this.channelPriority;
    };

    this.setDataflow = function(dataflow){
        //this.channelDataflow.clear();
        return this.channelDataflow.sendKeys(dataflow);
    };
    this.setService = function(service){
        //this.channelService.clear();
        return this.channelService.sendKeys(service);
    };
    this.setPriority = function(priority){
        this.channelPriority.clear();
        return this.channelPriority.sendKeys(priority);
    };
    //PANEL OF END POINTS DETAILS - End

    //TABLE methods and elements
    //this.table = $$('.table');
    //this.tableRows = $$('.table tbody tr');
    //this.tableResultsRows = $$('.table tbody.table-bordered tr');
    //this.getTable = function () {
    //   return this.table;
    //};
    //this.getTableRow = function(rowIndex) {
    //    return this.getTableRows().get(rowIndex);
    //};
    //this.getTableRows = function () {
    //    return this.tableRows;
    //};
    //this.getElementTable = function(rowIndex,columnIndex) {
    //    this.getTableRows().get(rowIndex).$$('td span').get(columnIndex).getText(); //To read the element in a position in the table
    //};

    //TABS

    //PAGE management
    this.clickManageChannelSaveButton = function () {
        this.manageChannelSaveButton.click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };

    this.clickManageChannelDelButton = function () {
        this.manageChannelDeleteButton.click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.id('btn-success')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };

    this.clickManageChannelConfirmButton = function () {
        this.manageChannelConfirmButton.click();

        browser.wait(function() {
            var deferred = protractor.promise.defer();
            element(by.buttonText('Confirm')).isPresent()
                .then(function (isPresent) {
                    deferred.fulfill(!isPresent);
                });
            return deferred.promise;
        });
    };

    this.clickNewChannelButton = function () {
        this.getNewChannelButton().click();
    };
    this.clickEditChannelButton = function () {
        this.getEditChannelButton().click();
    };
    this.clickDeleteChannelButton = function () {
        this.getDeleteChannelButton().click();
    };
    this.getPageUrl = function () {
        return browser.getCurrentUrl();
    };
    this.refreshPage = function () {
        return browser.navigate().refresh();
    };
};
module.exports =
    EndpointsChannelsPage;
