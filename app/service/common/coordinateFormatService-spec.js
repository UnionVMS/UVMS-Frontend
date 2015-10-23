describe('coordinateFormatService', function() {

  beforeEach(module('unionvmsWeb'));

  it('toDegreesWithDecimalMinutes should convert correct', inject(function(coordinateFormatService) {

    var toDecimalMinutes = coordinateFormatService.toDegreesWithDecimalMinutes;

    var input;
    input = '22.50';
	expect(toDecimalMinutes(input)).toEqual("22° 30,000′");

    input = '-22.50';
    expect(toDecimalMinutes(input)).toEqual("-22° 30,000′");

    input = '120.75';
    expect(toDecimalMinutes(input)).toEqual("120° 45,000′");

    input = '-120.75';
    expect(toDecimalMinutes(input)).toEqual("-120° 45,000′");

    input = '120.83';
    expect(toDecimalMinutes(input)).toEqual("120° 49,800′");

    input = '-120.83';
    expect(toDecimalMinutes(input)).toEqual("-120° 49,800′");

    input = '160.719';
    expect(toDecimalMinutes(input)).toEqual("160° 43,140′");

    expect(toDecimalMinutes(input, -1)).toEqual("160° 43,139999999999645′");

    expect(toDecimalMinutes(input, 0)).toEqual("160° 43′");

    //DECIMAL minutes
    input = "160° 43,152′";
    expect(toDecimalMinutes(input)).toEqual("160° 43,152′");

    input = "160 43,152′";
    expect(toDecimalMinutes(input)).toEqual("160° 43,152′");

    input = "160 43,152";
    expect(toDecimalMinutes(input)).toEqual("160° 43,152′");

    input = "160 43,152345";
    expect(toDecimalMinutes(input)).toEqual("160° 43,152′");

    input = "160 43,152345";
    expect(toDecimalMinutes(input, -1)).toEqual("160° 43,152345′");

    input = "160 43,152345";
    expect(toDecimalMinutes(input, 2)).toEqual("160° 43,15′");
  }));

  it('toDecimalDegrees should convert correct', inject(function(coordinateFormatService) {
    var toDecimalDegrees = coordinateFormatService.toDecimalDegrees;

    var input;
    input = '22° 30,00′';
    expect(toDecimalDegrees(input)).toEqual("22.500");

    input = '-22° 30,00′';
    expect(toDecimalDegrees(input)).toEqual("-22.500");

    input = "120° 45,00′";
    expect(toDecimalDegrees(input)).toEqual("120.750");

    input = "-120° 45,00′";
    expect(toDecimalDegrees(input)).toEqual("-120.750");

    input = "120° 49,80′";
    expect(toDecimalDegrees(input)).toEqual("120.830");

    input = "160° 43,14′";
    expect(toDecimalDegrees(input)).toEqual("160.719");

    input = "-180° 00,01′";
    expect(toDecimalDegrees(input)).toEqual("-180.000");
    expect(toDecimalDegrees(input, 0)).toEqual("-180");
    expect(toDecimalDegrees(input, 1)).toEqual("-180.0");
    expect(toDecimalDegrees(input, -1)).toEqual("-180.00016666666667");

    //Already decimal
    input = "160.719";
    expect(toDecimalDegrees(input)).toEqual("160.719");
    expect(toDecimalDegrees(input, 1)).toEqual("160.7");
    expect(toDecimalDegrees(input), -1).toEqual("160.719");

    input = "-160.719442365";
    expect(toDecimalDegrees(input)).toEqual("-160.719");
    expect(toDecimalDegrees(input,-1)).toEqual("-160.719442365");

    input = "-adssa";
    expect(toDecimalDegrees(input)).toEqual(input);

    input = undefined;
    expect(toDecimalDegrees(input)).toEqual(undefined);

    input = 160;
    expect(toDecimalDegrees(input)).toEqual('160.000');
  }));

  it('should convert between different formats without losing data', inject(function(coordinateFormatService) {
    var toDecimalDegrees = coordinateFormatService.toDecimalDegrees;
    var toDecimalMinutes = coordinateFormatService.toDegreesWithDecimalMinutes;

    var degreesWithDecimalMinutes, decimalDegrees, degreesWithDecimalMinutesAgain;
    degreesWithDecimalMinutes = '22° 30,000′';
    decimalDegrees = toDecimalDegrees(degreesWithDecimalMinutes, -1);
    degreesWithDecimalMinutesAgain = toDecimalMinutes(decimalDegrees, 3);
    expect(degreesWithDecimalMinutesAgain).toEqual(degreesWithDecimalMinutes);

    degreesWithDecimalMinutes = '-15° 45,000′';
    decimalDegrees = toDecimalDegrees(degreesWithDecimalMinutes, -1);
    degreesWithDecimalMinutesAgain = toDecimalMinutes(decimalDegrees, 3);
    expect(degreesWithDecimalMinutesAgain).toEqual(degreesWithDecimalMinutes);

    degreesWithDecimalMinutes = '160° 43,142′';
    decimalDegrees = toDecimalDegrees(degreesWithDecimalMinutes, -1);
    degreesWithDecimalMinutesAgain = toDecimalMinutes(decimalDegrees, 3);
    expect(degreesWithDecimalMinutesAgain).toEqual(degreesWithDecimalMinutes);
  }));

  it('isValidLatitude should return true only for valid latitudes', inject(function(coordinateFormatService) {
    var input;
    //Decimal degrees
    input = '22.54';
    expect(coordinateFormatService.isValidLatitude(input)).toBeTruthy();

    input = '-90.00';
    expect(coordinateFormatService.isValidLatitude(input)).toBeTruthy();

    input = '-90';
    expect(coordinateFormatService.isValidLatitude(input)).toBeTruthy();

    input = '-90.00001';
    expect(coordinateFormatService.isValidLatitude(input)).toBeFalsy();

    input = '90.00';
    expect(coordinateFormatService.isValidLatitude(input)).toBeTruthy();

    input = '90.01';
    expect(coordinateFormatService.isValidLatitude(input)).toBeFalsy();

    input = '2 90.01';
    expect(coordinateFormatService.isValidLatitude(input)).toBeFalsy();

    input = ' 90.01';
    expect(coordinateFormatService.isValidLatitude(input)).toBeFalsy();

    //Decimal minutes
    input = '22° 30,00′';
    expect(coordinateFormatService.isValidLatitude(input)).toBeTruthy();

    input = 'test 22° 30,00′';
    expect(coordinateFormatService.isValidLatitude(input)).toBeFalsy();

    input = '22° 30,00′ test';
    expect(coordinateFormatService.isValidLatitude(input)).toBeFalsy();

    input = '2220° 30,00′';
    expect(coordinateFormatService.isValidLatitude(input)).toBeFalsy();
  }));

  it('isValidLongitude should return true only for valid longitudes', inject(function(coordinateFormatService) {
    var input;
    //Decimal degrees
    input = '22.54';
    expect(coordinateFormatService.isValidLongitude(input)).toBeTruthy();

    input = '-180.00';
    expect(coordinateFormatService.isValidLongitude(input)).toBeTruthy();

    input = '-180';
    expect(coordinateFormatService.isValidLongitude(input)).toBeTruthy();

    input = '-180.00001';
    expect(coordinateFormatService.isValidLongitude(input)).toBeFalsy();

    input = '180.00';
    expect(coordinateFormatService.isValidLongitude(input)).toBeTruthy();

    input = '180.01';
    expect(coordinateFormatService.isValidLongitude(input)).toBeFalsy();

    input = '2 180.01';
    expect(coordinateFormatService.isValidLongitude(input)).toBeFalsy();

    input = ' 180.01';
    expect(coordinateFormatService.isValidLongitude(input)).toBeFalsy();

    //Decimal minutes
    input = '22° 30,00′';
    expect(coordinateFormatService.isValidLongitude(input)).toBeTruthy();

    input = '180° 00,00′';
    expect(coordinateFormatService.isValidLongitude(input)).toBeTruthy();

    input = '-180° 00,00′';
    expect(coordinateFormatService.isValidLongitude(input)).toBeTruthy();

    input = '00° 00,000′';
    expect(coordinateFormatService.isValidLongitude(input)).toBeTruthy();

    input = '-180° 00,01′';
    expect(coordinateFormatService.isValidLongitude(input)).toBeFalsy();

    input = 'test 22° 30,00′';
    expect(coordinateFormatService.isValidLongitude(input)).toBeFalsy();

    input = '22° 30,00′ test';
    expect(coordinateFormatService.isValidLongitude(input)).toBeFalsy();

    input = '2220° 30,00′';
    expect(coordinateFormatService.isValidLongitude(input)).toBeFalsy();
  }));

});