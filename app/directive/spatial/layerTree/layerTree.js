angular.module('unionvmsWeb').directive('layerTree', function(mapService, locale) {
	return {
		restrict: 'AE',
		replace: true,
		scope: true,
		controller: 'LayerpanelCtrl',
		templateUrl: 'directive/spatial/layerTree/layerTree.html',
		link: function(scope, element, attrs, fn) {
			scope.updateMap = function( event, data ){
				// Update map on layer select

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

						// fancytree is not sending event on drop-marker creation
						// therefore adding here.
						$( '#fancytree-drop-marker' )// otherwise drop-marker is not displayed the first time.
							.css( 'display', 'block' )
							.css( 'display', 'none' );
						$( '#fancytree-drop-marker' ).addClass( 'fa fa-arrow-right' );

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
						folder: true,
						expanded: true,
						children: [
							{
								title: 'Movements',
							},
							{
								title: 'Segments',
							}
						]
					},
					{
						title: 'spatial.layer_tree_areas',
						folder: true,
						expanded: true,
						children: [
								{
									title: 'spatial.layer_tree_system_areas',
									folder: true,
									children: [
										{
											title: 'EEZ - 1',
										},
										{
											title: 'FAO - 3',
										}
									]
								},
								{
									title: 'spatial.layer_tree_user_areas',
									folder: true,
									children: [
										{
											title: 'My Area 01',
										},
										{
											title: 'My Area 02',
										},
										{
											title: 'My Area 03',
										}
									]
								}
							]
						},
						{
							title: 'spatial.layer_tree_background_layers',
							folder: true,
							expanded: true,
							children: [
								{
									title: 'OpenStreetMap',
									selected: true,
									data: {
										exclusive_b: true,
										dnd_b: false
									},
									exclusive_a: true,
									dnd_a: true
								},
								{
									title: 'MyGeoserverBackgroundLayer',
								},
								{
									title: 'OpenSeaMap',
								},
								{
									title: 'Graticule',
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

			scope.$tree = $( element ).fancytree( 'getTree' );

			locale.ready( 'spatial' ).then( function() {
		      $( '.fancytree-title' ).each( function( index ) {
		        var key = $( this ).html();
		        $( this ).html( locale.getString( key ) );
		      });
		  });
		}
	};
});
