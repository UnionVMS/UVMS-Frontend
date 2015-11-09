describe('SearchResultListPage', function() {

	beforeEach(module('unionvmsWeb'));

	it('should find an element by guid', inject(function(SearchResultListPage) {
		var page = new SearchResultListPage();
		page.items.push({guid: "abc"});
		expect(page.hasItemWithGuid("abc")).toEqual(true);
		expect(page.hasItemWithGuid("xyz")).toEqual(false);
	}));

});
