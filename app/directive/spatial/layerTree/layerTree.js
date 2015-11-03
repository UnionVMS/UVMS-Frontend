angular.module('unionvmsWeb').directive('layerTree', function(mapService, locale) {
	return {
		restrict: 'AE',
		replace: true,
		scope: true,
		//controller: 'LayerpanelCtrl',
		templateUrl: 'directive/spatial/layerTree/layerTree.html',
		link: function(scope, element, attrs, fn) {
			// store maps layers for updating map.
			var mapLayers = null;
			scope.startState = {};
			scope.endState = {};

			// used to implement selectMode 1 for basemaps
			var lastSelectedBasemapNode = null;

			// check for impossible selections, restrict deselecting radiobutton
			var beforeSelectHandler = function( event, data ) {
				var selected = scope.$tree.getSelectedNodes(),
						basemaps = selected.filter( function( node ) {
							return ( node.data.isBaseLayer && node.isSelected() );
						});

				if ( lastSelectedBasemapNode === data.node &&
				 			basemaps.length === 1 ) {
					return ( false );
				}
			};

			// call tree and map update
			var selectHandler = function( event, data ){
				updateBasemap( event, data );
				if (data.node.hasChildren() === true){
				    loopFolderNodes(data.node);
				} else {
				    data.node.data.mapLayer.set( 'visible', data.node.isSelected() );
				}

				scope.$parent.$broadcast('reloadLegend');
			};

			var loopFolderNodes = function(parent){
			    $.each(parent.children, function(index, node){
			        if (node.hasChildren()){
			            loopFolderNodes(node);
			        } else {
			            node.data.mapLayer.set('visible', node.isSelected());
			        }
			    });
			};

			var renderNodeHandler = function( event, data ) {
				exchangeCheckboxWithRadio( event, data );

				if ( !data.node.data ) {
					return;
				}

				if ( data.node.data.hasOwnProperty( 'contextItems' ) ) {
					addContextMenu( data );
				}

				if ( data.node.data.popupEnabled === true ) {
					addInfo( data );
				}
			};

			// add info button to activate info-popup on layer
			var addInfo = function( data ) {
				var	tip,
						$title = $( data.node.span ).children( '.fancytree-title' ),
						$info = $title.children('.fa.fa-info');

				if ( $info.length > 0 ) {
					return;
				}

				tip = data.node.data.popupTip;
				$( '<span class="fa fa-info fancytree-clickable" title="'+tip+'"></span>' )
					.appendTo( $title )
					.on( 'click', function(event){
						var node,
								$target = $( event.target ),
								active = $target.hasClass( 'info-selected' );

						$('.info-selected').removeClass( 'info-selected' );

						if ( !active ) {
							node = $.ui.fancytree.getNode( event.target );
							$target.addClass( 'info-selected' );
							mapService.activeLayerType = node.data.type;
						} else {
							mapService.activeLayerType = undefined;
						}
					});
			};

			// add button to open context menu on layer
			var addContextMenu = function( data ) {
				var tip,
						$title = $( data.node.span ).children( '.fancytree-title' );

				if ( $title.hasClass( 'layertree-menu' ) ) {
					return;
				}

				tip = data.node.data.contextTip;
				$title
					.addClass( 'layertree-menu' )
					.append( '<span class="fa fa-caret-down fancytree-clickable" title="'+tip+'"></span>' );
			};

			// Update map on layer select and initial creation
			var updateMap = function() {
				var source;

				if ( !scope.$tree ) {
					return;
				}

				source = scope.$tree.toDict( true ).children;
				reverseTreeSource( source );
				mapLayers = mapService.map.getLayers().getArray();
				addLayers( source );
				scope.$parent.$broadcast('reloadLegend');
			};

			// reverse nested array
			var reverseTreeSource = function( array ) {
				array = array.reverse();
				$.each( array, function( index, value ) {
					if ( value.folder ) {
						reverseTreeSource( value.children );
					}
				});
			};

			// add and reorder layers
			var addLayers = function( folder ) {
				var layersByTitle, layer, treeNode;

				$.each( folder, function( index, value ) {
					if ( value.folder ) {
						addLayers( value.children );
						return ( true );// = continue;
					}

					if ( !value.data ) { return ( true ); }

					layersByTitle = mapLayers.filter( function( layer ){
					    return layer.get( 'title' ) === value.data.title;
					});

					layer = layersByTitle[ 0 ];

					if ( !layer ) {
						layer = mapService.createLayer( value.data );
						if (!layer) { return ( true ); }// layer creation failed
					}

					treeNode = scope.$tree.getNodeByKey( value.key );
					treeNode.data.mapLayer = layer;

					mapService.map.removeLayer( layer );// remove to have it reordered
					layer.set( 'visible', value.selected );// don't request tiles if not selected
					if (layer.get('type') === 'vmsseg'){
					    //Add feature highlight layer before the vms segments and positions
					    mapService.addFeatureOverlay();
					}
					mapService.map.addLayer( layer );
				});
			};

			// apply radiobutton behaviour and set basemap
			var updateBasemap = function( event, data ) {
				var $span, classStr,
						layerData = data.node.data;

				if ( !layerData || !layerData.isBaseLayer ) {
					return;
				}

				// get currently selected node and deselect it
				if ( scope.$tree &&
							lastSelectedBasemapNode &&
							lastSelectedBasemapNode !== data.node ) {
					lastSelectedBasemapNode.setSelected( false );
				}

				// get checkbox element and change it to radiobutton
				$span = $( data.node.span ).children( '.fancytree-checkbox' );
				$span
					.removeClass( 'fa-check-square-o' )
					.removeClass( 'fa-check-square' );

				classStr = data.node.selected ? 'fa-dot-circle-o' : 'fa-circle-thin';
				$span.addClass( classStr );

				if ( lastSelectedBasemapNode !== data.node && data.node.selected ) {
					lastSelectedBasemapNode = data.node;
				}
			};

			// exchange checkboxes with radiobuttons
			var exchangeCheckboxWithRadio = function ( event, data ) {
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

			var updateLayerTreeSource = function( event, source ) {
				scope.$tree.reload( source );
				updateMap();
			};

			var addLayerTreeNode = function ( event, node ) {
				var root = scope.$tree.getRootNode();
				root.addChildren( node, scope.$tree.getFirstChild() );
				updateMap();
			};
			
			//Get layer index in the ol layers collection
			var getLayerIdxByTitle = function(title){
                var layers = mapService.map.getLayers();
                var lyrIdx;
                layers.forEach(function(lyr, idx, mpLyrs){
                    if (lyr.get('title') === title){
                        lyrIdx = idx;
                    }
                });
                
                return lyrIdx;
            };
            
            //Support for node dragging inside folder
            var changeLayerOrder = function(node){
                var layers = mapService.map.getLayers();
                for (var i in scope.startState){
                    layers.removeAt(scope.startState[i].idxMap);
                }
                
                for (i in scope.endState){
                    layers.insertAt(scope.endState[i].idxMap, scope.startState[i].layer);
                }
                
                scope.startState = {};
                scope.endState = {};
            };

			// Intial liveview source
			scope.source = [{
				title: locale.getString('spatial.layer_tree_background_layers'),
				folder: true,
				expanded: true,
				unselectable: true,
				hideCheckbox: true,
				extraClasses: 'layertree-baselayer-node',
				key: 'basemap',
				children: [{
					title: 'OpenStreetMap',
					selected: true,
					extraClasses: 'layertree-basemap',
					data: {
						type: 'OSM',
						isBaseLayer: true,
						title: 'OpenStreetMap'
					}
				}]
			}];

			// font awesome config for fancy tree
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
			
			// initially create tree
			var createTree = function( source ){

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
							
							var childNodes = node.parent.children;
							for (var i = 0; i < childNodes.length; i++){
							    scope.startState[childNodes[i].title] = {
							       idxTree: i,
							       idxMap: getLayerIdxByTitle(childNodes[i].title),
							       layer: mapService.getLayerByTitle(childNodes[i].title)
							    };
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
							
							var childNodes = node.parent.children;
							for (var i = 0; i < childNodes.length; i++){
                                scope.endState[childNodes[i].title] = {
                                   idxTree: i,
                                   idxMap: scope.startState[childNodes[i].title].idxMap + (scope.startState[childNodes[i].title].idxTree - i) 
                                };
                            }
							changeLayerOrder();
							scope.$parent.$broadcast('reloadLegend');
						}
					},
					glyph: glyph_opts,
					selectMode: 3,
					source: source,
					wide: {
						iconWidth: '0em',     // Adjust this if @fancy-icon-width != '16px'
						iconSpacing: '0.75em', // Adjust this if @fancy-icon-spacing != '3px'
						levelOfs: '1em'     // Adjust this if ul padding != '16px'
					},
					beforeSelect: beforeSelectHandler,
					select: selectHandler,
					createNode: updateBasemap,
					renderNode: renderNodeHandler,
					// fancytree updates the checkboxes on these events
					expand: exchangeCheckboxWithRadio,
					init: exchangeCheckboxWithRadio,
					click: exchangeCheckboxWithRadio,
					activate: exchangeCheckboxWithRadio,
					blurTree: exchangeCheckboxWithRadio
				});

				scope.$tree = $( element ).fancytree( 'getTree' );
				updateMap();
			};

			locale.ready( 'spatial' ).then( function() {
				createTree( scope.source );
			});

			scope.$on( 'updateLayerTreeSource', updateLayerTreeSource );
			scope.$on( 'addLayerTreeNode', addLayerTreeNode );
		}
	};
});
