describe('showIfAllowed', function() {

    beforeEach(module('unionvmsWeb'));

    var scope,compile;

    // Store references to $rootScope and $compile
    // so they are available to all tests in this describe block
    beforeEach(inject(function(_$compile_, _$rootScope_, $httpBackend){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;

        //Mock translation files for usm
        $httpBackend.whenGET(/^usm\//).respond({});
    }));

    it('should not remove the element if the user is allowed to the feature', function() {

        inject(function(userService){
            //Access granted
            spyOn(userService, "isAllowed").andReturn(true);       
        });

        //Create element using the directive
        var element = $compile("<div><span show-if-allowed='viewTest'>Test</span></div>")($rootScope);

        // Check that the compiled element has not been removed and still contains the string Test
        expect(element.html()).toContain('Test');
    });

    it('should remove the element if the user is not allowed to the feature', function() {

        inject(function(userService){
            //Access denied
            spyOn(userService, "isAllowed").andReturn(false);      
        });

        //Create element using the directive
        var element = $compile("<div><span show-if-allowed='viewTest'>Test</span></div>")($rootScope);

        // Check that the compiled element has been removed
        expect(element.html()).not.toContain('Test');
    });

});