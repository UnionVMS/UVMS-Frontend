/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name faReportDocTile
 * @description
 *  A reusable tile that will display the fishing activity report document and associated FLUX repor document info
 */
angular.module('unionvmsWeb').directive('faReportDocTile', function() {
	return {
		restrict: 'E',
		replace: false,
		scope: {
		    faReport: '='
		},
		templateUrl: 'directive/activity/faReportDocTile/faReportDocTile.html'
	};
});
