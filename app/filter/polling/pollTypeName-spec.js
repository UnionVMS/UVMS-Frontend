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
describe('pollTypeName', function() {

    beforeEach(module('unionvmsWeb'));

    it('should return correct name for MANUAL_POLL', inject(function($filter, locale) {
        spyOn(locale, "getString").andReturn("Manual");
        var filter = $filter('pollTypeName');

        expect(filter('MANUAL_POLL')).toEqual('Manual');

    }));

    it('should return unformated name for all values not defined', inject(function($filter, locale) {
        spyOn(locale, "getString").andReturn("'%%KEY_NOT_FOUND%%'");

        var filter = $filter('pollTypeName');

        expect(filter('TEST')).toEqual('TEST');

    }));

});