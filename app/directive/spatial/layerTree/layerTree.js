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
				    vmsVisibilityListener(data.node);
				}

				scope.$parent.$broadcast('reloadLegend');
			};

			var loopFolderNodes = function(parent){
                $.each(parent.children, function(index, node){
                    if (node.hasChildren()){
                        loopFolderNodes(node);
                    } else {
                        node.data.mapLayer.set('visible', node.isSelected());
                        vmsVisibilityListener(node);
                    }
                });
            };

            //Be sure to close labels and popups when we toggle layer visibility
			var vmsVisibilityListener = function(node){
			    //Deal with labels
			    var target, className, closePopup = false;
			    if (node.data.type === 'vmspos' && node.isSelected() === false){
			        if (mapService.vmsposLabels.active === true){
			            mapService.deactivateVectorLabels('vmspos');
	                    target = $(node.span).children('.fancytree-title').children('.fa.fa-tags');
	                    className = 'label-selected-' + node.data.type;
			        }

			        //Opened clusters should be closed automatically
			        var select = mapService.getInteractionsByType('Select')[0];
			        if (angular.isDefined(select)){
		                var selFeatures = select.getFeatures();
		                selFeatures.clear();
			        }
                }

                if (node.data.type === 'vmsseg' && mapService.vmssegLabels.active === true && node.isSelected() === false){
                    mapService.deactivateVectorLabels('vmsseg');
                    target = $(node.span).children('.fancytree-title').children('.fa.fa-tags');
                    className = 'label-selected-' + node.data.type;
                }

                if (angular.isDefined(target) && target.hasClass(className)){
                    target.removeClass(className);
                }

                //Deal with popups
                if (mapService.activeLayerType === node.data.type && angular.isDefined(mapService.overlay) && node.isSelected() === false){
                    mapService.closePopup();
                    mapService.activeLayerType = undefined;
                    target = $(node.span).children('.fancytree-title').children('.fa.fa-info-circle');
                    if (target.hasClass('info-selected')){
                        target.removeClass('info-selected');
                    }
                }
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

				if (data.node.data.labelEnabled === true){
				    addLabel( data );
				}

			};

			//add label button for vectors
			var addLabel = function(data){
			    var tip,
			        $title = $(data.node.span).children('.fancytree-title'),
			        $info = $title.children('.fa.fa-tags');

			    if ($info.length > 0){
			        return;
			    }

			    tip = locale.getString(data.node.data.labelTip);
			    var cls = 'fa fa-tags fancytree-clickable';

			    var empty = false;
			    if ((data.node.data.type === 'vmspos' && mapService.labelVisibility.positions.length === 0) || (data.node.data.type === 'vmsseg' && mapService.labelVisibility.segments.length === 0)){
			        tip = locale.getString('spatial.layer_tree_empty_popup_label_visibility_settings');
			        empty = true;
			        cls += ' label-disabled';
			    }

			    $('<span class="' + cls + '" title="'+tip+'"></span>')
			        .appendTo($title)
			        .on('click', function(event){
			            var layer = data.node.data.mapLayer;
			            var node = $.ui.fancytree.getNode( event.target ),
			                $target = $(event.target);

			            if (!empty){
			                var active = $target.hasClass('label-selected-' + data.node.data.type);
			                if (layer.get('visible') === true){
	                            if (!active){
	                                $target.addClass( 'label-selected-' + data.node.data.type);
	                                mapService.activateVectorLabels(node.data.type);
	                            } else {
	                                $target.removeClass( 'label-selected-'  + data.node.data.type );
	                                mapService.deactivateVectorLabels(node.data.type);
	                            }
	                        }
			            }
			        });
			};

			// add info button to activate info-popup on layer
			var addInfo = function( data ) {
				var	tip,
						$title = $( data.node.span ).children( '.fancytree-title' ),
						$info = $title.children('.fa.fa-info-circle');

				if ( $info.length > 0 ) {
					return;
				}

				tip = locale.getString(data.node.data.popupTip);
				var cls = 'fa fa-info-circle fancytree-clickable';

                var empty = false;
                if ((data.node.data.type === 'vmspos' && mapService.popupVisibility.positions.length === 0) || (data.node.data.type === 'vmsseg' && mapService.popupVisibility.segments.length === 0)){
                    tip = locale.getString('spatial.layer_tree_empty_popup_label_visibility_settings');
                    empty = true;
                    cls += ' info-disabled';
                }

				$( '<span class="' + cls + '" title="'+tip+'"></span>' )
					.appendTo( $title )
					.on( 'click', function(event){
						var node, $target = $( event.target );

						if (!empty){
						    var active = $target.hasClass( 'info-selected' );
						    if (data.node.isSelected() === true){
	                            $('.info-selected').removeClass( 'info-selected' );

	                            if ( !active ) {
	                                node = $.ui.fancytree.getNode( event.target );
	                                $target.addClass( 'info-selected' );
	                                mapService.activeLayerType = node.data.type;
	                            } else {
	                                mapService.closePopup();
	                                mapService.activeLayerType = undefined;
	                            }
	                        }
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
					.append( '<span class="fa fa-cog fancytree-clickable fancytree-context-menu-btn" title="'+tip+'"></span>' );
			};

			// Update map on layer select and initial creation
			var updateMap = function() {
				var source;

				if ( !scope.$tree || !angular.isDefined(mapService.map)) {
					return;
				}

				source = scope.$tree.toDict( true ).children;
				if (angular.isDefined(source)) {
                    reverseTreeSource( source );
                    mapLayers = mapService.map.getLayers().getArray();
                    addLayers( source );
                    scope.$parent.$broadcast('reloadLegend');
                }
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
					    var found = true;

					    if (layer.get('type') === 'WMS'){
					        var params = layer.getSource().getParams();
					        if (angular.isDefined(params) && angular.isDefined(value.data.params) && params.LAYERS !== value.data.params.LAYERS){
					            found = false;
					        }
					    }
					    return layer.get( 'title' ) === value.data.title && layer.get('isBaseLayer') === value.data.isBaseLayer && found;
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
			    mapService.removeAllLayers();
				scope.$tree.reload( source );
				updateMap();
			};

			var addLayerTreeNode = function ( event, node ) {
				var root = scope.$tree.getRootNode();
				root.addChildren( node, scope.$tree.getFirstChild() );
				updateMap();
			};

			var removeVmsNodes = function(event){
				var root = scope.$tree.getRootNode();
				var nodesOfInterest = ['vmsdata', 'alarms'];

				angular.forEach(nodesOfInterest, function(item) {
					var target = root.findAll(function(node){
					    return node.data.type === item;
					});

					for (var i = 0; i < target.length; i++){
					    root.removeChild(target[i]);
					}
				});

			};

			//Get layer index in the ol layers collection
			var getLayerIdx = function(mapLayer){
                var layers = mapService.map.getLayers();
                var lyrIdx;
                layers.forEach(function(lyr, idx, mpLyrs){
                    if (_.isEqual(lyr, mapLayer)){
                        lyrIdx = idx;
                    }
                });

                return lyrIdx;
            };

            //Support for node dragging inside folder
            var changeLayerOrder = function(node){
                var layers = mapService.map.getLayers();
                for (var i in scope.startState){
                    layers.remove(scope.startState[i].layer);
                }

                var numLayersRemoved = _.keys(scope.startState).length;

                var startIdx;
                var counter = 0;
                for (i in scope.endState){
                    if (counter === 0){
                        startIdx = scope.endState[i].idxMap - numLayersRemoved + 1;
                    }
                    layers.insertAt(startIdx,scope.startState[i].layer);
                    counter += 1;
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
							    scope.startState[childNodes[i].title + childNodes[i].key] = {
							       idxTree: i,
							       idxMap: getLayerIdx(childNodes[i].data.mapLayer),
							       layer: childNodes[i].data.mapLayer
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
                                scope.endState[childNodes[i].title + childNodes[i].key] = {
                                   idxTree: i,
                                   idxMap: scope.startState[childNodes[i].title + childNodes[i].key].idxMap + (scope.startState[childNodes[i].title + childNodes[i].key].idxTree - i)
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
			scope.$on( 'removeVmsNodes', removeVmsNodes);
		}
	};
});
