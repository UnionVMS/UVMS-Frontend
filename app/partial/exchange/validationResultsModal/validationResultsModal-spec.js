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
describe('ValidationresultsmodalCtrl', function () {
  var ctrl, ValidationResultsSpy, msgGuid, xpath, modalInstanceSpy;
  beforeEach(module('unionvmsWeb'));
  beforeEach(function () {

    modalInstanceSpy = jasmine.createSpyObj('$uibModalInstance', ['dismiss']);
    module(function ($provide) {
      $provide.value('$uibModalInstance', modalInstanceSpy);
    });
    builMocks();
  });
  beforeEach(inject(function ($rootScope, $controller, $q, exchangeRestService) {
    scope = $rootScope.$new();
    var deferred = $q.defer();
    ValidationResultsSpy = spyOn(exchangeRestService, 'getValidationResults').andReturn(deferred.promise);
    ctrl = $controller('ValidationresultsmodalCtrl', {
      $scope: scope,
      msgGuid: msgGuid
    });
    scope.msg = '<?xml version="1.0" encoding="UTF-8"?><rsm:FLUXFAReportMessage xmlns:rsm="urn:un:unece:uncefact:data:standard:FLUXFAReportMessage:3" xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:20" xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:20" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:un:unece:uncefact:data:standard:FLUXFAReportMessage:3 xsd/FLUXFAReportMessage_3p1/FLUXFAReportMessage_3p1.xsd"><rsm:FLUXReportDocument><ram:ID schemeID="UUID">689D407D-3E2C-45B4-A817-AB21BFC8BFF4</ram:ID><ram:CreationDateTime><udt:DateTime>2017-01-02T03:54:00Z</udt:DateTime></ram:CreationDateTime><ram:PurposeCode listID="FLUX_GP_PURPOSE">9</ram:PurposeCode><ram:OwnerFLUXParty><ram:ID schemeID="FLUX_GP_PARTY">CZE</ram:ID></ram:OwnerFLUXParty></rsm:FLUXReportDocument><rsm:FAReportDocument><ram:TypeCode listID="FLUX_FA_REPORT_TYPE">DECLARATION</ram:TypeCode><ram:AcceptanceDateTime><udt:DateTime>2017-01-02T03:54:00Z</udt:DateTime></ram:AcceptanceDateTime><ram:RelatedFLUXReportDocument><ram:ID schemeID="UUID">EBA93D3A-F2D9-4D63-84F1-4768C634F1A7</ram:ID><ram:CreationDateTime><udt:DateTime>2017-01-02T03:55:00Z</udt:DateTime></ram:CreationDateTime><ram:PurposeCode listID="FLUX_GP_PURPOSE">9</ram:PurposeCode><ram:OwnerFLUXParty><ram:ID schemeID="FLUX_GP_PARTY">CZE</ram:ID></ram:OwnerFLUXParty></ram:RelatedFLUXReportDocument><ram:SpecifiedFishingActivity><ram:SpecifiedDelimitedPeriod listID="FLUX_FA_TYPE">DEPARTURE</ram:SpecifiedDelimitedPeriod><ram:TypeCode listID="FLUX_FA_TYPE">DEPARTURE</ram:TypeCode><ram:OccurrenceDateTime><udt:DateTime>2016-12-12T13:00:00Z</udt:DateTime></ram:OccurrenceDateTime><ram:RelatedFLUXLocation><ram:TypeCode listID="FLUX_LOCATION_TYPE">LOCATION</ram:TypeCode><ram:ID schemeID="LOCATION">ZADUR</ram:ID></ram:RelatedFLUXLocation><ram:SpecifiedFishingGear><ram:TypeCode listID="GEAR_TYPE">LLD</ram:TypeCode><ram:RoleCode listID="FA_GEAR_ROLE">ONBOARD</ram:RoleCode><ram:ApplicableGearCharacteristic><ram:TypeCode listID="FA_GEAR_CHARACTERISTIC">GD</ram:TypeCode><ram:Value>0</ram:Value></ram:ApplicableGearCharacteristic><ram:ApplicableGearCharacteristic><ram:TypeCode listID="FA_GEAR_CHARACTERISTIC">GN</ram:TypeCode><ram:ValueQuantity unitCode="C62">1200</ram:ValueQuantity></ram:ApplicableGearCharacteristic></ram:SpecifiedFishingGear><ram:SpecifiedFishingTrip><ram:ID schemeID="EU_TRIP_ID">CZE-TRP-fc20c2cfacacac000000</ram:ID></ram:SpecifiedFishingTrip></ram:SpecifiedFishingActivity><ram:SpecifiedVesselTransportMeans><ram:ID schemeID="CFR">CZE123456789</ram:ID><ram:ID schemeID="IRCS">IRCS9</ram:ID><ram:ID schemeID="EXT_MARK">XR009</ram:ID><ram:ID schemeID="ICCAT">ATEU0CZE13245</ram:ID><ram:ID schemeID="UVI">0001110</ram:ID><ram:Name>Lima</ram:Name><ram:RegistrationVesselCountry><ram:ID schemeID="TERRITORY">CZE</ram:ID></ram:RegistrationVesselCountry><ram:SpecifiedContactParty><ram:RoleCode listID="FLUX_CONTACT_ROLE">MASTER</ram:RoleCode><ram:SpecifiedStructuredAddress><ram:StreetName>Street V</ram:StreetName><ram:CityName>City R</ram:CityName><ram:CountryID schemeID="TERRITORY">CZE</ram:CountryID></ram:SpecifiedStructuredAddress><ram:SpecifiedContactPerson><ram:GivenName>John</ram:GivenName><ram:FamilyName>L</ram:FamilyName><ram:Alias>Master L</ram:Alias></ram:SpecifiedContactPerson></ram:SpecifiedContactParty></ram:SpecifiedVesselTransportMeans></rsm:FAReportDocument></rsm:FLUXFAReportMessage>';
  }));
  function highligthCode(xpath) {
    return true;
  }

  function builMocks() {
    xpath = "((//*[local-name()='FLUXFAReportMessage']//*[local-name()='FAReportDocument'])[1]//*[local-name()='SpecifiedFishingActivity'])[1]//*[local-name()='SpecifiedDelimitedPeriod']";
    modalInstanceSpy.dismiss.andCallFake(function () {
      return;
    });
  }
  it('ValidationResults should be called', inject(function () {
    expect(ValidationResultsSpy).toHaveBeenCalled();
  }));

  it('showError method should be called', inject(function () {
    scope.showError(xpath);
    expect(scope.showError).toBeTruthy();
  }));

  it('togglePanelVisibility should be called', inject(function () {
    scope.togglePanelVisibility(xpath);
    expect(scope.togglePanelVisibility).toBeTruthy();
  }));

  it('cancel method should be called', inject(function () {
    scope.cancel();
    expect(scope.cancel).toBeTruthy();
  }));
});
