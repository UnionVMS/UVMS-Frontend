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
(function() {
    angular.module('unionvmsWeb').factory('assetCsvService', function(locale, csvService, $filter, globalSettingsService) {
        return {
            download: function(asset) {
                var header = getHeader(asset);
                var rows = getRows(asset);
                var filename = getCsvFilename(asset);
                csvService.downloadCSVFile(rows, header, filename);
            }
        };

        function getHeader(asset) {
            return [
                locale.getString('vessel.vessel_details_flagstate'),
                locale.getString('vessel.vessel_details_IRCS_code'),
                locale.getString('vessel.vessel_details_name'),
                locale.getString('vessel.vessel_details_ext_marking'),
                locale.getString('vessel.vessel_details_CFR'),
                locale.getString('vessel.vessel_details_UVI'),
                locale.getString('vessel.vessel_details_ICCAT'),
                locale.getString('vessel.vessel_details_home_port'),
                locale.getString('vessel.vessel_details_gear_type'),
                locale.getString("vessel.vessel_details_MMSI_no"),
                locale.getString("vessel.vessel_details_license_type"),
                getLengthHeader(),
                getTonnageHeader(),
                getMainPowerHeader(),
                locale.getString("vessel.po_name"),
                locale.getString("vessel.po_code"),
                locale.getString("vessel.vessel_details_contacts"),
            ];
        }

        function getRows(asset) {
            return [[
                asset.countryCode,
                asset.ircs,
                asset.name,
                asset.externalMarking,
                asset.cfr,
                asset.uvi,
                asset.iccat,
                asset.homePort,
                asset.gearType,
                asset.mmsiNo,
                asset.licenseType,
                $filter('length')(asset.lengthValue),
                asset.grossTonnage,
                asset.powerMain,
                asset.producer.name,
                asset.producer.id,
                getContactsDetails(asset)
            ]];
        }

        function getCsvFilename(asset) {
            return asset.vesselId.guid + '.csv';
        }

        function getLengthHeader() {
            var unit = locale.getString("common.short_length_unit_" + globalSettingsService.getLengthUnit());
            var length = locale.getString("vessel.vessel_details_length");
            return length + " (" + unit + ")";
        }

        function getTonnageHeader() {
            var tonnage = locale.getString("vessel.vessel_details_tonnage");
            var unit = locale.getString("common.tons");
            return tonnage + " (" + unit + ")";
        }

        function getMainPowerHeader() {
            var mainPower = locale.getString("vessel.vessel_details_main_power");
            var unit = locale.getString("common.kw");
            return mainPower + " (" + unit + ")";
        }

        function getContactsDetails(asset) {
            var tempContactsDetails = [];
            for (var i = 0; i < asset.contact.length; i++) { 
                tempContactsDetails.push(asset.contact[i].name + " " + asset.contact[i].email + " " + asset.contact[i].number);
            }
            var contactsDetails = tempContactsDetails.join(', ');
            return [contactsDetails];
        }
    });
})();