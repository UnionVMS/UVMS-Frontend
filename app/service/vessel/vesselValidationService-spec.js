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
describe('vesselValidationService', function() {

  beforeEach(module('unionvmsWeb'));

  it('getCFRPattern should return regexp for CFR that matches 3 digits followed by 9 digits', inject(function(vesselValidationService) {

    //3 letters followed by 9 digits - should be ok
    var cfr = 'ABC123456790';
	expect(cfr.match(vesselValidationService.getCFRPattern())).toBeTruthy();

    //Everything else shold be invalid
    cfr = 'AB123456789';
    expect(cfr.match(vesselValidationService.getCFRPattern())).toBeFalsy();
    cfr = 'ABC1234567899';
    expect(cfr.match(vesselValidationService.getCFRPattern())).toBeFalsy();
    cfr = '';
    expect(cfr.match(vesselValidationService.getCFRPattern())).toBeFalsy();
    cfr = 'AAAA';
    expect(cfr.match(vesselValidationService.getCFRPattern())).toBeFalsy();
  }));

  it('getMMSIPattern should return regexp for MMSI that matches exactly 9 digits', inject(function(vesselValidationService) {

    //Exactly 9 digits
    var mmsi = '123456790';
    expect(mmsi.match(vesselValidationService.getMMSIPattern())).toBeTruthy();

    //Everything else shold be invalid
    mmsi = '123456';
    expect(mmsi.match(vesselValidationService.getMMSIPattern())).toBeFalsy();
    mmsi = 'ABCDEFGHI';
    expect(mmsi.match(vesselValidationService.getMMSIPattern())).toBeFalsy();
    mmsi = '';
    expect(mmsi.match(vesselValidationService.getMMSIPattern())).toBeFalsy();
    mmsi = '123456789123';
    expect(mmsi.match(vesselValidationService.getMMSIPattern())).toBeFalsy();
  }));

  it('getMaxTwoDecimalsPattern should return regexp that matches number with max 2 decimals', inject(function(vesselValidationService) {

    //Max two decimals, comma or dot is valid
    var numberInput = '12';
    expect(numberInput.match(vesselValidationService.getMaxTwoDecimalsPattern())).toBeTruthy();
    numberInput = '12.1';
    expect(numberInput.match(vesselValidationService.getMaxTwoDecimalsPattern())).toBeTruthy();
    numberInput = '12.12';
    expect(numberInput.match(vesselValidationService.getMaxTwoDecimalsPattern())).toBeTruthy();
    numberInput = '12,12';
    expect(numberInput.match(vesselValidationService.getMaxTwoDecimalsPattern())).toBeTruthy();
    numberInput = '0.12';
    expect(numberInput.match(vesselValidationService.getMaxTwoDecimalsPattern())).toBeTruthy();
    numberInput = '121235345.99';
    expect(numberInput.match(vesselValidationService.getMaxTwoDecimalsPattern())).toBeTruthy();

    //Everything else shold be invalid
    numberInput = '12.123';
    expect(numberInput.match(vesselValidationService.getMaxTwoDecimalsPattern())).toBeFalsy();
    numberInput = '0,345';
    expect(numberInput.match(vesselValidationService.getMaxTwoDecimalsPattern())).toBeFalsy();
    numberInput = '12:23';
    expect(numberInput.match(vesselValidationService.getMaxTwoDecimalsPattern())).toBeFalsy();
    numberInput = '';
    expect(numberInput.match(vesselValidationService.getMaxTwoDecimalsPattern())).toBeFalsy();
  }));

});
