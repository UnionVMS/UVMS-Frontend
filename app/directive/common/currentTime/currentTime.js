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
angular.module('unionvmsWeb').directive('currentTime', function($timeout, globalSettingsService) {
	return {
		restrict: 'E',
		link: function(scope, element, attrs, fn) {

            function displayCurrentTime() {

                // Create UTC time and date
                var format = globalSettingsService.getDateFormat(),
                    date = moment.utc().format('YYYY-MM-DD'),
                    time = moment.utc().format('HH:mm');

                    if (format === 'YY/MM/DD HH:mm:ss') {
                        date = moment.utc().format('YYYY/MM/DD');
                    }

                element.html(
                    '<span class="current-time">' +
                        '<span class="date">' + date + '</span> ' +
                        '<span class="time">'+ time + '</span> ' +
                        '<span class="format">UTC</span>' +
                    '</span>'
                );
            }

            // Update time every second
            function updateTime() {
                $timeout(function() {
                  displayCurrentTime();
                  updateTime();
                }, 1000);
            }

            updateTime();
		}
	};
});
