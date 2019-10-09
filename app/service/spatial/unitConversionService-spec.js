/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
describe('The unitConversionService', function() {
    var sut;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function(unitConversionService) {
        sut = unitConversionService;
    }));

    describe('when converting duration', function() {
        it('converts a duration to human-readable form, assuming seconds as the default unit', function() {
            expect(sut.duration.timeToHuman(3665)).toBe('1h 1m 5s');
        });

        it('converts a duration to human-readable form, taking into account units in Moment format', function() {
            expect(sut.duration.timeToHuman(90065000, 'milliseconds')).toBe('1d 1h 1m 5s');
        });
    });
});
