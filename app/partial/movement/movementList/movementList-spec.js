describe('MovementlistCtrl', function() {

    beforeEach(module('unionvmsWeb'));

    var scope, ctrl;

    beforeEach(inject(function($rootScope, $controller, Movement) {
        scope = $rootScope.$new();
        m1 = new Movement();
        m2 = new Movement();
        scope.currentSearchResults = { items: [m1, m2] };
        ctrl = $controller('MovementlistCtrl', {
            $scope: scope
        });
    }));

    it('should check all if not all checked already', function(Movement) {
        spyOn(scope, 'isAllChecked').andReturn(false);
        scope.clearSelection = jasmine.createSpy('clearSelection')
        scope.addToSelection = jasmine.createSpy('addToSelection')
        scope.checkAll();
        expect(scope.isAllChecked).toHaveBeenCalled();
        expect(scope.clearSelection).toHaveBeenCalled();
        expect(scope.addToSelection).toHaveBeenCalledWith(m1);
        expect(scope.addToSelection).toHaveBeenCalledWith(m2);
    });

    it('should clear selection if all checked', function() {
        spyOn(scope, 'isAllChecked').andReturn(true);
        scope.clearSelection = jasmine.createSpy('clearSelection')
        scope.addToSelection = jasmine.createSpy('addToSelection')
        scope.checkAll();
        expect(scope.clearSelection).toHaveBeenCalled();
        expect(scope.isAllChecked).toHaveBeenCalled();
        expect(scope.addToSelection).not.toHaveBeenCalled();
    });

    it('should check item', function() {
        spyOn(scope, 'isChecked').andReturn(false);
        scope.removeFromSelection = jasmine.createSpy('removeFromSelection')
        scope.addToSelection = jasmine.createSpy('addToSelection')

        m1.Selected = false;
        scope.checkItem(m1);
        expect(scope.addToSelection).toHaveBeenCalled();
        expect(scope.removeFromSelection).not.toHaveBeenCalled();
        expect(m1.Selected).toBe(true);
    });

    it('should uncheck item', function() {
        spyOn(scope, 'isChecked').andReturn(true);
        scope.removeFromSelection = jasmine.createSpy('removeFromSelection')
        scope.addToSelection = jasmine.createSpy('addToSelection')

        m1.Selected = true;
        scope.checkItem(m1);
        expect(scope.removeFromSelection).toHaveBeenCalled();
        expect(scope.addToSelection).not.toHaveBeenCalled();
        expect(m1.Selected).toBe(false);
    });

    it('should return true if all checked', function() {
        scope.selectedMovements = scope.currentSearchResults.items;
        expect(scope.isAllChecked()).toBe(true);
    });

    it('should return fales if not all checked', function() {
        scope.selectedMovements = [scope.currentSearchResults.items[0]];
        expect(scope.isAllChecked()).toBe(false);
    });

    it('should return true if checked', function() {
        scope.selectedMovements = [m1];
        expect(scope.isChecked(m1)).toBe(true);
    });

    it('should return false if not checked', function() {
        scope.selectedMovements = [m1];
        expect(scope.isChecked(m2)).toBe(false);
    });

});