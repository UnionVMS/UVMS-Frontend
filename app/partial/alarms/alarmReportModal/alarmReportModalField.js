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
	'use strict';

	angular
		.module('unionvmsWeb')
		.directive('alarmReportField', AlarmReportField);

	function AlarmReportField() {
		return {
			restrict: 'A',
			scope: {
				fieldValue: '=',
				alarmReportField: '='
			},
			template:
				'<label>{{alarmReportField | i18n}}</label>' +
				'<div ng-if="fieldValue !== undefined" class="value">{{fieldValue}}</div>' +
				'<div ng-if="fieldValue === undefined" class="value missing">{{"alarms.position_report_information_value_missing" | i18n}}</div>'
		};
	}

})();