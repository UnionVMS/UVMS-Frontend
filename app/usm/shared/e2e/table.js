/*
 This class contains all the common elements of a Table
 */
var Table = function () {

    var EC = protractor.ExpectedConditions;

//TABLE methods and elements
    this.table = $$('.table');
    this.tableRows = $$('.table tbody tr');
    this.tableResultsRows = $$('.table tbody.table-bordered tr');

    this.clickDetailButton = function (rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button').click();
        //  browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };

    this.clickDetailViewButton = function (rowIndex) {
        //this.getTableRows().get(rowIndex).$$('td button').get(1).click(); //The view details button occupies the second position in the table
		var row = this.getTableRows().get(rowIndex);
		browser.waitForAngular();
		var cols = row.$$('td button');
		cols.get(1).click();
        //browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };

    this.getViewButton = function(name){
        return this.getOrganisationByName(name)
            .then(function(el){
                return el.element(by.css('td button .fa-eye'));
            });
    };

    this.getOrganisationByName = function(idElement,value){
        //console.log('trying to get org with name: '+name);
        //browser.pause();
        var orgsP = this.getOrganisationsList();
        var filterFn = function(elemF,index){
            //console.log('filtering for '+name+' on index '+index);
            return elemF.element(by.binding(idElement)).getText().then(function(text) {
                //console.log('testing '+text+' against expected '+name);
                return text == value;
            });
        };

        return orgsP.filter(filterFn).then(function(els){
            //console.log('els length '+els.length);
            //console.log(els[0]);
            if(els.length === 0)return null;
            return els[0];
        });
    };


    this.clickRowEditButton = function (rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button').get(0).click(); //The edit button occupies the first position in the table
        //  browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };

    this.clickRowDeleteButton = function (rowIndex) {
        this.getTableRows().get(rowIndex).$$('td button').get(2).click(); //The delete button occupies the third position in the table
        //  browser.wait(EC.visibilityOf(this.detailsSpanRole), 10000);
    };

    this.getTable = function () {
        return this.table ;
    };

    this.getTableRow = function (rowIndex) {
        return this.getTableRows().get(rowIndex);
    };

    this.getTableRows = function () {
        return this.tableRows;
    };

    //Loading message
    this.loadingMessage = $$('.table tbody.tr td');

    this.getLoadingMessage = function () {
        return this.loadingMessage.getText();
    };
};

module.exports = Table;
