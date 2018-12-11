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
    angular.module('unionvmsWeb').factory('mobileTerminalCsvService', function(configurationService, locale, csvService, $filter) {
        return {
            download: function(mobileTerminal) {
                var header = getHeader(mobileTerminal);
                var rows = getRows(mobileTerminal);
                var filename = getCsvFilename(mobileTerminal);
                csvService.downloadCSVFile(rows, header, filename);
            }
        };

        function getHeader(mobileTerminal) {
            if (mobileTerminal.mobileTerminalType === 'INMARSAT_C') {
                return [
                    locale.getString('mobileTerminal.table_header_transponder_type'),
                    locale.getString('mobileTerminal.add_new_form_ocean_region_label'),
                    locale.getString('mobileTerminal.table_header_serial_no'),
                    locale.getString('mobileTerminal.form_inmarsatc_transceiver_type_label'),
                    locale.getString('mobileTerminal.form_inmarsatc_software_version_label'),
                    locale.getString('mobileTerminal.form_inmarsatc_antenna_label'),
                    locale.getString('mobileTerminal.table_header_satellite_number'),
                    locale.getString('mobileTerminal.form_inmarsatc_answer_back_label'),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_channel_channel_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_selectedchannel_poll_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_selectedchannel_con_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_selectedchannel_def_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_selectedchannel_dnid_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_selectedchannel_member_no_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_selectedchannel_land_station_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_selectedchannel_started_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_selectedchannel_stopped_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_installed_by_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_installed_on_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_started_on_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_uninstalled_on_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_expected_freq_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_grace_period_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_in_port_grace_period_label")
                ];
            }
            else if (mobileTerminal.mobileTerminalType === 'IRIDIUM') {
                return [
                    locale.getString('mobileTerminal.table_header_transponder_type'),
                    locale.getString('mobileTerminal.table_header_serial_no'),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_channel_channel_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_selectedchannel_poll_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_selectedchannel_con_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_selectedchannel_def_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_selectedchannel_started_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_communication_selectedchannel_stopped_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_installed_by_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_installed_on_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_started_on_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_uninstalled_on_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_expected_freq_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_grace_period_label"),
                    locale.getString("mobileTerminal.form_inmarsatc_in_port_grace_period_label")
                ];
            }
            else {
                return [];
            }
        }

        function getRows(mobileTerminal) {
            if (mobileTerminal.mobileTerminalType === 'INMARSAT_C') {
                return mobileTerminal.channels.map(function(channel) {
                    return [
                        $filter('transponderName')(mobileTerminal.mobileTerminalType),
                        getOceanRegions(mobileTerminal),
                        mobileTerminal.serialNo,
                        mobileTerminal.transceiverType,
                        mobileTerminal.softwareVersion,
                        mobileTerminal.antenna,
                        mobileTerminal.satelliteNumber,
                        mobileTerminal.answerBack,
                        channel.name,            
                        channel.defaultChannel,
                        channel.configChannel,
                        channel.pollChannel,
                        channel.DNID,
                        channel.memberNumber,
                        channel.lesDescription,
                        $filter('confDateFormat')(channel.startDate),
                        $filter('confDateFormat')(channel.endDate),
                        channel.installedBy,
                        $filter('confDateFormat')(channel.installDate),
                        $filter('confDateFormat')(channel.startDate),
                        $filter('confDateFormat')(channel.uninstallDate),
                        channel.expectedFrequency,
                        channel.frequencyGracePeriod,
                        channel.expectedFrequencyInPort
                    ];
                });
            }
            else if (mobileTerminal.mobileTerminalType === 'IRIDIUM') {
                return mobileTerminal.channels.map(function(channel) {
                    return [
                        $filter('transponderName')(mobileTerminal.mobileTerminalType),
                        mobileTerminal.serialNo,
                        channel.name,
                        channel.defaultChannel,
                        channel.configChannel,
                        channel.pollChannel,
                        $filter('confDateFormat')(channel.startDate),
                        $filter('confDateFormat')(channel.endDate),
                        channel.installedBy,
                        $filter('confDateFormat')(channel.installDate),
                        $filter('confDateFormat')(channel.startDate),
                        $filter('confDateFormat')(channel.uninstallDate),
                        channel.expectedFrequency,
                        channel.frequencyGracePeriod,
                        channel.expectedFrequencyInPort
                    ];
                });
            }
            else {
                return [];
            }
        }

        function getCsvFilename(mobileTerminal) {
            return mobileTerminal.guid + '.csv';
        }

        function getTransponderType(mobileTerminal) {
            return mobileTerminal.mobileTerminalType + ": " + mobileTerminal.plugin.name;
        }

        function getOceanRegions(mobileTerminal) {
            // Oceans supported by the mobile terminal type's configuration
            var terminalCapabilities = configurationService
                .getConfig('MOBILE_TERMINAL_TRANSPONDERS')
                .terminalConfigs[mobileTerminal.mobileTerminalType]
                .capabilities;

            var selectedOceans = [];
            if (terminalCapabilities.SUPPORT_SINGLE_OCEAN && mobileTerminal.attributes.SINGLE_OCEAN) {
                selectedOceans = selectedOceans.concat(mobileTerminal.attributes.SINGLE_OCEAN);
            }
            else if (terminalCapabilities.SUPPORT_MULTIPLE_OCEAN && mobileTerminal.attributes.MULTIPLE_OCEAN) {
                selectedOceans = selectedOceans.concat(mobileTerminal.attributes.MULTIPLE_OCEAN);
            }

            var oceans = terminalCapabilities.SUPPORT_MULTIPLE_OCEAN;
            return oceans.filter(function(ocean) {
                // Filter selected oceans only
                return selectedOceans.indexOf(String(ocean.code)) >= 0;
            }).map(function(ocean) {
                // Get each ocean's text value
                return ocean.text;
            }).join('+');
        }

    });
})();
