angular.module('unionvmsWeb').directive('layerTree', function() {
	return {
		restrict: 'AE',
		replace: true,
		scope: true,
		controller: 'LayerpanelCtrl',
		templateUrl: 'directive/spatial/layerTree/layerTree.html',
		link: function(scope, element, attrs, fn) {
			scope.updateMap = function( event, data ){
				// Update map on layer select
				var foo;
			};
			var glyph_opts = {
				map: {
					doc: 'fa fa-file-o',
          docOpen: 'fa fa-file-o',
          checkbox: 'fa fa-square-o',
          checkboxSelected: 'fa fa-check-square-o',
          checkboxUnknown: 'fa fa-check-square',
          dragHelper: 'fa arrow-right',
          dropMarker: 'fa long-arrow-right',
          error: 'fa fa-warning',
          expanderClosed: 'fa fa-plus-square-o',
          expanderLazy: 'fa fa-angle-right',
          expanderOpen: 'fa fa-minus-square-o',
          folder: 'fa fa-folder-o',
          folderOpen: 'fa fa-folder-open-o',
          loading: 'fa fa-spinner fa-pulse'
				}
			};
			// Create the tree.
		  element.fancytree(
			{
				select: scope.updateMap,
				icons: false,
				extensions: ['dnd', 'glyph', 'wide'],
				checkbox: true,
				dnd: {
					focusOnClick: true,
					dragStart: function(node, data) {
						if ( node.isFolder() ) {
							return false;
						}
						return true;
					},
					dragEnter: function(node, data) {
						/*if ( node.parent !== data.otherNode.parent ) {
								return false;
						}*/
						return ['before', 'after'];
					},
					dragOver: function( node, data ) {},
					dragLeave: function( node, data ) {},
					dragStop: function( node, data ) {},
					dragDrop: function(node, data) { data.otherNode.moveTo(node, data.hitMode); }
				},
				glyph: glyph_opts,
				selectMode: 3,
				source: [
					{
						title: 'spatial.layer_tree_vms',
						key: '1',
						folder: true,
						expanded: true,
						children: [
							{
								title: 'Movements',
								key: '2'
							},
							{
								title: 'Segments',
								key: '3'
							}
						]
					},
					{
						title: 'spatial.layer_tree_areas',
						key: '5',
						folder: true,
						expanded: true,
						children: [
								{
									title: 'spatial.layer_tree_system_areas',
									key: '6',
									folder: true,
									children: [
										{
											title: 'EEZ - 1',
											key: '7'
										},
										{
											title: 'FAO - 3',
											key: '8'
										}
									]
								},
								{
									title: 'spatial.layer_tree_user_areas',
									key: '10',
									folder: true,
									children: [
										{
											title: 'My Area 01',
											key: '11'
										},
										{
											title: 'My Area 02',
											key: '12'
										},
										{
											title: 'My Area 03',
											key: '13'
										}
									]
								}
							]
						},
						{
							title: 'spatial.layer_tree_background_layers',
							key: '14',
							folder: true,
							expanded: true,
							children: [
								{
									title: 'OpenStreetMap',
									key: '15',
									selected: true
								},
								{
									title: 'MyGeoserverBackgroundLayer',
									key: '16'
								},
								{
									title: 'OpenSeaMap',
									key: '17'
								},
								{
									title: 'Graticule',
									key: '18'
								}
							]
						}
				],
				wide: {
					iconWidth: '0em',     // Adjust this if @fancy-icon-width != '16px'
					iconSpacing: '0.75em', // Adjust this if @fancy-icon-spacing != '3px'
					levelOfs: '1em'     // Adjust this if ul padding != '16px'
				},
				iconClass: function(event, data){
					// if( data.node.isFolder() ) {
					// 	return 'glyphicon glyphicon-book';
					// }
				}
			});

		}
	};
});
