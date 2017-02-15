angular.module('unionvmsWeb').directive('catchClassSpecieDetailTile', function(locale) {
	return {
		restrict: 'E',
		replace: true,
		scope: {

		},
		templateUrl: 'directive/activity/catchClassSpecieDetailTile/catchClassSpecieDetailTile.html',
		link: function(scope, element, attrs, fn) {

			scope.columnOrder = [
				{
					id: 'location',
					text: locale.getString('activity.catch_class_specie_column_location')
				},
				{
					id: 'specie',
					text: locale.getString('activity.catch_class_specie_column_specie')
				},
				{
					id: 'lsc',
					text: locale.getString('activity.catch_class_specie_column_lsc')
				},
				{
					id: 'bms',
					text: locale.getString('activity.catch_class_specie_column_bms')
				},
				{
					id: 'dim',
					text: locale.getString('activity.catch_class_specie_column_dim')
				},
				{
					id: 'dis',
					text: locale.getString('activity.catch_class_specie_column_dis')
				}
			];


			scope.data = [
				{
					location: 'location1',
					specie: 'specie1',
					lsc: 1,
					bms: 3,
					dim: 2,
					dis: 4
				},
				{
					location: 'location2',
					specie: 'specie1',
					lsc: 1,
					bms: 3,
					dim: 2,
					dis: 4
				},
				{
					location: 'location3',
					specie: 'specie1',
					lsc: 1,
					bms: 3,
					dim: 2,
					dis: 4
				},
				{
					location: 'location4',
					specie: 'specie1',
					lsc: 1,
					bms: 3,
					dim: 2,
					dis: 4
				}
			];

		}
	};
});
