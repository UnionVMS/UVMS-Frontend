angular.module('unionvmsWeb').directive('catchClassSpecieDetailTile', function(locale) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			tileTitle: '@',
		    ngModel: '=',
		    isLocationClickable: '=',
		    bufferDistance: '@',
		    clickCallback: '&'
		},
		templateUrl: 'directive/activity/catchClassSpecieDetailTile/catchClassSpecieDetailTile.html',
		link: function(scope, element, attrs, fn) {

			scope.columnOrder = [
				{
					id: 'locations',
					text: locale.getString('activity.catch_class_specie_column_location'),
					value: 'name'
				},
				{
					id: 'species',
					text: locale.getString('activity.catch_class_specie_column_specie')
				},
				{
					id: 'lsc',
					text: locale.getString('activity.catch_class_specie_column_lsc'),
					value: 'weight'
				},
				{
					id: 'bms',
					text: locale.getString('activity.catch_class_specie_column_bms'),
					value: 'weight'
				},
				{
					id: 'dis',
					text: locale.getString('activity.catch_class_specie_column_dis'),
					value: 'weight'
				},
				{
					id: 'dim',
					text: locale.getString('activity.catch_class_specie_column_dim'),
					value: 'weight'
				}
			];

			scope.classColumnOrder = ['lsc', 'bms', 'dis', 'dim'];

			scope.ngModel[0].selected = true;
			scope.selectedSpecieLocation = scope.ngModel[0];
			scope.selectedClass = 'lsc';

			scope.selectClass = function(className){
				scope.selectedClass = className;
			};
		}
	};
});
