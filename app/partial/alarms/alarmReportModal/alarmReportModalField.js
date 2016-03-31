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