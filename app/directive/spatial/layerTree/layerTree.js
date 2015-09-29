angular.module('unionvmsWeb').directive('layerTree', function(mapService, locale) {
	return {
		restrict: 'AE',
		replace: true,
		scope: true,
		//controller: 'LayerpanelCtrl',
		templateUrl: 'directive/spatial/layerTree/layerTree.html',
		link: function(scope, element, attrs, fn) {
			scope.mapService = mapService;

			// check for impossible selections, restrict deselecting radiobutton
			scope.beforeSelectHandler = function( event, data ) {
				var selected = scope.$tree.getSelectedNodes(),
						basemaps = selected.filter( function( node ) {
							return ( node.data.isBaseLayer && node.isSelected() );
						});

				if ( scope.lastSelectedBasemapNode === data.node &&
				 			basemaps.length === 1 ) {
					return ( false );
				}
				
				//FIXME we might do this on a layer basis which would probably be better
				scope.$parent.$broadcast('reloadLegend');
			};

			// call tree and map update
			scope.selectHandler = function( event, data ){
				scope.updateBasemap( event, data );
				scope.updateMap();
			};

			// store maps layers for updating map.
			scope.mapLayers = null;
			// Update map on layer select and initial creation
			scope.updateMap = function() {
				var source;

				if ( !scope.$tree ) {
					return;
				}

				source = scope.$tree.toDict( true ).children;
				scope.reverse( source );
				scope.mapLayers = scope.mapService.map.getLayers().getArray();
				scope.addLayers( source );
			};

			scope.reverse = function( array ) {
				array = array.reverse();
				$.each( array, function( index, value ) {
					if ( value.folder ) {
						scope.reverse( value.children );
					}
				});
			};

			scope.addLayers = function( folder ) {
				var layersByTitle, layer;
				$.each( folder, function( index, value ) {
					if ( value.folder ) {
						scope.addLayers( value.children );
						return ( true );// = continue;
					}

					if ( !value.data ) { return ( true ); }

					layersByTitle = scope.mapLayers.filter( function( layer ){
			        return layer.get( 'title' ) === value.data.title;
			    });

					layer = layersByTitle[ 0 ];

					if ( !value.selected ) {
						if ( layer ) {
						scope.mapService.map.removeLayer( layer );
						}
						return ( true );
					}

					if ( layer ) { return ( true ); }

					if ( !value.data.mapLayer ) {
						value.data.mapLayer = scope.mapService.createLayer( value.data );
					}

					// layer creation failed
					if ( !value.data.mapLayer ) { return ( true ); }

					scope.mapService.map.addLayer( value.data.mapLayer );
				});
			};

			// used to implement selectMode 1 for basemaps
			scope.lastSelectedBasemapNode = null;

			// apply radiobutton behaviour and set basemap
			scope.updateBasemap = function( event, data ) {
				var $span, classStr,
						layerData = data.node.data;

				if ( !layerData || !layerData.isBaseLayer ) {
					return;
				}

				// get currently selected node and deselect it
				if ( scope.$tree &&
							scope.lastSelectedBasemapNode &&
							scope.lastSelectedBasemapNode !== data.node ) {
					scope.lastSelectedBasemapNode.setSelected( false );
				}

				// get checkbox element and change it to radiobutton
				$span = $( data.node.span ).children( '.fancytree-checkbox' );
				$span
					.removeClass( 'fa-check-square-o' )
					.removeClass( 'fa-check-square' );

				classStr = data.node.selected ? 'fa-dot-circle-o' : 'fa-circle-thin';
				$span.addClass( classStr );

				if ( scope.lastSelectedBasemapNode !== data.node && data.node.selected ) {
					scope.lastSelectedBasemapNode = data.node;
				}
			};

			// exchange checkboxes with radiobuttons
			scope.exchangeCheckboxWithRadio = function ( event, data ) {
				var $basemaps = jQuery( '.layertree-basemap' );

				$basemaps.each( function( index ) {
					var $children = $( this ).children( '.fa-check-square-o' );
					$children
						.removeClass( 'fa-check-square-o' )
						.addClass( 'fa-dot-circle-o' );

					$children = $( this ).children( '.fa-square-o' );
					$children
						.removeClass( 'fa-square-o' )
						.addClass( 'fa-circle-thin' );
				});
			};

			scope.source = [
				{
					title: 'spatial.layer_tree_vms',
					folder: true,
					expanded: true,
					children: [
						{
							title: 'spatial.layer_tree_positions',
							data: {
								excludeDnd: true
							}
						},
						{
							title: 'spatial.layer_tree_segments',
							data: {
								excludeDnd: true
							}
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
										title: 'EEZ',
										data: {
											layerType: 'WMS',
											title: 'eez',
											isBaseLayer: false,
											attributions: [ 'This is a custom layer from UnionVMS' ],
											url: 'http://localhost:8080/geoserver/wms',
			                serverType: 'geoserver',
			                params: {
			                    'LAYERS': 'uvms:eez',
			                    'TILED': true,
			                    'STYLES': 'eez_label_geom'
			                    //'cql_filter': "sovereign='Portugal' OR sovereign='Poland' OR sovereign='Bulgaria' OR sovereign='Belgium'"
			                }
										}
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
						unselectable: true,
						key: 'basemap',
						children: [
							{
								title: 'OpenStreetMap',
								selected: true,
								extraClasses: 'layertree-basemap',
								data: {
									isBaseLayer: true,
									title: 'osm'
								}
							},
							{
								title: 'MyGeoserverBackgroundLayer',
								extraClasses: 'layertree-basemap',
								data: {
									isBaseLayer: true
								}
							},
							{
								title: 'OpenSeaMap',
								extraClasses: 'layertree-basemap',
								data: {
									isBaseLayer: true
								}
							},
							{
								title: 'Graticule',
								extraClasses: 'layertree-basemap',
								data: {
									isBaseLayer: true
								}
							}
						]
					}
			];

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
		  element.fancytree({
				icons: false,
				extensions: [ 'dnd', 'glyph', 'wide' ],
				checkbox: true,
				dnd: {
					focusOnClick: true,
					dragStart: function( node, data ) {
						if ( node.isFolder() ||
									node.data.isBaseLayer ||
									node.data.excludeDnd ) {
							return false;
						}

						return true;
					},
					dragEnter: function( node, data ) {

						// fancytree is not sending event on drop-marker creation
						// therefore adding here.
						$( '#fancytree-drop-marker' )
							.css( 'display', 'block' )// otherwise drop-marker is not displayed the first time.
							.css( 'display', 'none' );
						$( '#fancytree-drop-marker' ).addClass( 'fa fa-arrow-right' );

						if ( node.parent !== data.otherNode.parent ) {
							return ( false );
						}

						return [ 'before', 'after' ];
					},
					dragOver: function( node, data ) {},
					dragLeave: function( node, data ) {},
					dragStop: function( node, data ) {},
					dragDrop: function( node, data ) {
						data.otherNode.moveTo( node, data.hitMode );
						scope.updateMap();
					}
				},
				glyph: glyph_opts,
				selectMode: 3,
				source: scope.source,
				wide: {
					iconWidth: '0em',     // Adjust this if @fancy-icon-width != '16px'
					iconSpacing: '0.75em', // Adjust this if @fancy-icon-spacing != '3px'
					levelOfs: '1em'     // Adjust this if ul padding != '16px'
				},
				beforeSelect: scope.beforeSelectHandler,
				select: scope.selectHandler,
				createNode: scope.updateBasemap,
				// fancytree updates the checkboxes on these events
				expand: scope.exchangeCheckboxWithRadio,
				init: scope.exchangeCheckboxWithRadio,
				renderNode: scope.exchangeCheckboxWithRadio,
				click: scope.exchangeCheckboxWithRadio,
				activate: scope.exchangeCheckboxWithRadio,
				blurTree: scope.exchangeCheckboxWithRadio
			});

			scope.$tree = $( element ).fancytree( 'getTree' );

			scope.updateMap();

			locale.ready( 'spatial' ).then( function() {
		      $( '.fancytree-title' ).each( function( index ) {
		        var key = $( this ).html();
		        $( this ).html( locale.getString( key ) );
		      });
		  });
		}
	};
});
