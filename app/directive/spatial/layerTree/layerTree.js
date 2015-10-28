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

				//FIXME we might do this on a layer basis which would probably be better
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

			var addInfo = function( data ) {
				var $title = $( data.node.span ).children( '.fancytree-title' ),
						$info = $title.children('.fa.fa-info');

				if ( $info.length > 0 ) {
					return;
				}

				$( '<span class="fa fa-info fancytree-clickable "></span>' )
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

			var addContextMenu = function( data ) {
				var $title = $( data.node.span ).children( '.fancytree-title' );

				if ( $title.hasClass( 'layertree-menu' ) ) {
					return;
				}

				$title
					.addClass( 'layertree-menu' )
					.append( '<span class="fa fa-caret-down fancytree-clickable "></span>' );
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
				setLocale();
			};

			var addLayerTreeNode = function ( event, node ) {
				var root = scope.$tree.getRootNode();
				root.addChildren( node, scope.$tree.getFirstChild() );
				updateMap();
				setLocale();
			};

			// mocking source
			scope.source = [
				{
					title: 'spatial.layer_tree_vms',
					folder: true,
					expanded: true,
					children: [
						{
							title: 'spatial.layer_tree_positions',
							data: {
								excludeDnd: true,
								title: 'Positions',
								type: 'vmspos',
								popupEnabled: true,
								geoJson:{
									"features": [
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 14,
												"con_id": "f58b2274-ff5b-4ac7-9911-ea0591b203fa",
												"color": "#669900",
												"m_spd": 9,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 7,
												"cc": "SWE0",
												"stat": "dykgtIUT",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													71.1963,
													13.2849
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 11,
												"con_id": "bbe4c107-c802-4fbe-93b5-2e72fd5e2c74",
												"color": "#66FFFF",
												"m_spd": 1,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 36,
												"cc": "SWE0",
												"stat": "xTicwSMohiDCGabr",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													70.7949,
													-6.2093
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 15,
												"con_id": "9513d32d-6f88-4818-92d9-5979fc66fe6c",
												"color": "#CC66FF",
												"m_spd": 46,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 50,
												"cc": "SWE0",
												"stat": "XwIctRVELHznkV",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													69.5924,
													-2.222
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 10,
												"con_id": "71092bf0-3aa7-41fe-9d0a-7407c617c8b7",
												"color": "#663300",
												"m_spd": 32,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 16,
												"cc": "SWE0",
												"stat": "nUacxaDLsueEYEoGKzf",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													71.5542,
													-7.2003
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 2,
												"con_id": "9955fe4c-372e-440b-bd86-bc709bce4d48",
												"color": "#CC66FF",
												"m_spd": 38,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 17,
												"cc": "SWE0",
												"stat": "KkzniOqSZ",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													70.0771,
													5.0839
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 18,
												"con_id": "34ff6a4e-3192-4baa-a5d0-1e480e7eb8d1",
												"color": "#669900",
												"m_spd": 0,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 6,
												"cc": "SWE0",
												"stat": "xnBXcjSXTZcn",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													70.1507,
													-1.1627
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 3,
												"con_id": "026b7448-fa7d-4a1b-b65f-b70cb4ee82c8",
												"color": "#0000FF",
												"m_spd": 34,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 42,
												"cc": "SWE0",
												"stat": "nWpvDeSFW",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													70.8722,
													8.4345
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 14,
												"con_id": "1f619d97-25f9-463a-9414-69924d8ce4d8",
												"color": "#A3A385",
												"m_spd": 3,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 33,
												"cc": "SWE0",
												"stat": "jILxF",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													71.614,
													1.9222
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 18,
												"con_id": "194c6988-6b04-4dce-944d-2589cea81bcb",
												"color": "#FF0000",
												"m_spd": 25,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 6,
												"cc": "SWE0",
												"stat": "PrDHTSBeVgYXGnlCvCk",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													70.6639,
													2.7391
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 16,
												"con_id": "57965022-ad35-4534-8638-65037700bdb6",
												"color": "#660033",
												"m_spd": 34,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 25,
												"cc": "SWE0",
												"stat": "CTPMbDQmj",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													66.5214,
													8.3384
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 16,
												"con_id": "af128944-65b9-4a67-bccd-c0325495438d",
												"color": "#990000",
												"m_spd": 8,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 20,
												"cc": "SWE0",
												"stat": "lgaSjDOqTdbWNZsY",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													67.2995,
													3.367
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 9,
												"con_id": "d927ed5c-d10e-4f15-bde8-3a514f3cb46d",
												"color": "#669900",
												"m_spd": 47,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 19,
												"cc": "SWE0",
												"stat": "HhTenBEigAMyXyDdhk",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													69.7225,
													10.1027
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 6,
												"con_id": "25bbbb08-37e0-476f-99e5-2785e71ed232",
												"color": "#663300",
												"m_spd": 27,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 48,
												"cc": "SWE0",
												"stat": "RHkNPbYtdBEJ",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													68.2486,
													2.8863
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 4,
												"con_id": "a944987c-01ef-4f5a-8934-fff60a80a688",
												"color": "#663300",
												"m_spd": 15,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 22,
												"cc": "SWE0",
												"stat": "TTreMlcfhUTQrBouXor",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													66.9233,
													5.021
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 1,
												"con_id": "c0ef4157-865f-4485-8ea1-bc5adb3cdceb",
												"color": "#663300",
												"m_spd": 33,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 36,
												"cc": "SWE0",
												"stat": "YrfyVjkffXo",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													68.6219,
													14.281
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 3,
												"con_id": "65e8e218-eb0e-4da5-9530-383fda99bd73",
												"color": "#FF0000",
												"m_spd": 6,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 6,
												"cc": "SWE0",
												"stat": "BQNDcMEejRXFaoimR",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													71.7651,
													11.0498
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 10,
												"con_id": "3aad3650-e813-43ec-8127-953d47799d9f",
												"color": "#00FFFF",
												"m_spd": 23,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 24,
												"cc": "SWE0",
												"stat": "JGhiUtxYXOeuQTFUOU",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													68.3738,
													13.9743
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 16,
												"con_id": "4f5dd4f8-a522-4679-8b29-c92cd3b07eff",
												"color": "#FF0000",
												"m_spd": 24,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 38,
												"cc": "SWE0",
												"stat": "nDKCTQiiqHhOdn",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													67.4419,
													10.6852
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 10,
												"con_id": "4c96ee41-bbb3-4880-a0f3-42ec30265b41",
												"color": "#663300",
												"m_spd": 35,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 11,
												"cc": "SWE0",
												"stat": "uTzbXGabSavtkyonH",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													64.9122,
													-1.4315
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 6,
												"con_id": "9e35d4c0-4b54-4b06-bc36-15a400e26a6b",
												"color": "#663300",
												"m_spd": 42,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 11,
												"cc": "SWE0",
												"stat": "haJrzO",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													71.6157,
													12.5407
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 10,
												"con_id": "7b2ddd24-2241-42ab-ba84-86a52902facc",
												"color": "#0000FF",
												"m_spd": 31,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 27,
												"cc": "SWE0",
												"stat": "oUxSaPOFciB",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													67.3217,
													1.1735
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 15,
												"con_id": "29dbf652-0651-4b60-9266-c282a419a54f",
												"color": "#66FFFF",
												"m_spd": 11,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 31,
												"cc": "SWE0",
												"stat": "eUXyd",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													66.0596,
													8.0424
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 13,
												"con_id": "4c6254c6-4e6d-4e47-b359-a70b856fced6",
												"color": "#669900",
												"m_spd": 28,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 30,
												"cc": "SWE0",
												"stat": "LNSEGr",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													67.6219,
													-4.6656
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 8,
												"con_id": "ccbd9644-9e1f-4184-9580-9173c18d6aed",
												"color": "#990000",
												"m_spd": 34,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 36,
												"cc": "SWE0",
												"stat": "NKdyziguCM",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													66.8897,
													0.0588
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 6,
												"con_id": "cddc53e7-7def-45f1-9a66-4fa238df6c9f",
												"color": "#990000",
												"m_spd": 0,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 15,
												"cc": "SWE0",
												"stat": "ftYEZbnXDNfUxBkH",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													71.1272,
													6.9334
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 6,
												"con_id": "eb07a924-7b99-47b7-ad7c-3d5c9123292f",
												"color": "#00FFFF",
												"m_spd": 48,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 47,
												"cc": "SWE0",
												"stat": "nDIsvT",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													69.4908,
													-5.6578
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 7,
												"con_id": "3de567aa-159d-461f-82f5-1da08f157bac",
												"color": "#660033",
												"m_spd": 40,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 49,
												"cc": "SWE0",
												"stat": "nlmibOvKwHQ",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													66.5245,
													8.1637
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 9,
												"con_id": "7f19f2d0-feb4-4340-bb18-c76bf8444e99",
												"color": "#990000",
												"m_spd": 29,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 16,
												"cc": "SWE0",
												"stat": "mZKeTDGDxNAWhYF",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													71.7219,
													-7.203
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 5,
												"con_id": "ac944c31-fb2a-4f58-b30e-cdf2b2bd798a",
												"color": "#A3A385",
												"m_spd": 36,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 39,
												"cc": "SWE0",
												"stat": "MAeXy",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													70.9983,
													1.8191
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 18,
												"con_id": "04df1be1-5fa5-4e24-b937-3acc0d6fa84f",
												"color": "#660033",
												"m_spd": 3,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 8,
												"cc": "SWE0",
												"stat": "vyXlZHqadjev",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													71.9848,
													-4.0537
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 18,
												"con_id": "a809c167-a77d-4eb6-9078-144bd802e879",
												"color": "#A3A385",
												"m_spd": 31,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 39,
												"cc": "SWE0",
												"stat": "QczoKTmwRMGjPuWofDDT",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													68.4217,
													7.4135
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 12,
												"con_id": "b59124be-c347-4129-bdc4-72221145a221",
												"color": "#990000",
												"m_spd": 39,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 37,
												"cc": "SWE0",
												"stat": "eJDypaJR",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													68.2698,
													-5.6394
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 15,
												"con_id": "611b1d63-ccdd-4bbb-98a9-f1ab0c9a5fb7",
												"color": "#669900",
												"m_spd": 5,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 40,
												"cc": "SWE0",
												"stat": "wXLgHCORXSxBqOGHbtC",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													69.3506,
													8.4189
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 19,
												"con_id": "e77de8d0-0d70-4bf7-acc2-4d98245eda27",
												"color": "#00FFFF",
												"m_spd": 10,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 10,
												"cc": "SWE0",
												"stat": "zmZXlNpZnZoLoZ",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													69.453,
													5.1144
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 2,
												"con_id": "ef97c140-4d00-4e21-96e6-56dc73475607",
												"color": "#669900",
												"m_spd": 7,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 35,
												"cc": "SWE0",
												"stat": "YvIRAv",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													68.799,
													0.8752
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 1,
												"con_id": "7c5fc29d-eaf4-47d9-9fb7-539cb55958bc",
												"color": "#66FFFF",
												"m_spd": 26,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 8,
												"cc": "SWE0",
												"stat": "CYtLzbPGqNDzRCtJCql",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													69.4015,
													14.5006
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 6,
												"con_id": "af4fba7b-0448-47c5-96aa-48a229716cb2",
												"color": "#663300",
												"m_spd": 50,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 31,
												"cc": "SWE0",
												"stat": "PvCKRovrlpn",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													65.5265,
													5.6752
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 4,
												"con_id": "201c9c3e-209a-4cb0-9698-1002092c85bd",
												"color": "#FF0000",
												"m_spd": 20,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 20,
												"cc": "SWE0",
												"stat": "mXQpRYonPwirDIqvit",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													71.2585,
													6.145
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 8,
												"con_id": "fc996b42-1d0b-4e4c-abc3-8a38e412bee3",
												"color": "#FF0000",
												"m_spd": 31,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 12,
												"cc": "SWE0",
												"stat": "vdZaNedopphEJKJWh",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													68.0059,
													4.8815
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 7,
												"con_id": "ebbdcf26-e174-4e97-953b-2887cc2d2161",
												"color": "#A3A385",
												"m_spd": 44,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 23,
												"cc": "SWE0",
												"stat": "odlYElBcWEzxw",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													64.821,
													-1.361
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 18,
												"con_id": "7f815b7c-a735-4fee-a338-430b65726d5a",
												"color": "#FF0000",
												"m_spd": 13,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 32,
												"cc": "SWE0",
												"stat": "TZyLBzNwpL",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													69.6312,
													5.9909
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 13,
												"con_id": "2080f840-1a9a-4aed-8c9b-73e24965bd21",
												"color": "#FF0000",
												"m_spd": 30,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 22,
												"cc": "SWE0",
												"stat": "icoNGtLlVpi",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													72.5099,
													9.9676
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 4,
												"con_id": "ef5b16b3-347c-4105-8461-68527193a1c0",
												"color": "#FF0000",
												"m_spd": 35,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 23,
												"cc": "SWE0",
												"stat": "pcWhngilb",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													65.8078,
													6.5601
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"crs": 1,
												"con_id": "62b04049-3f5c-4393-9f85-bf59e335e760",
												"color": "#660033",
												"m_spd": 6,
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"c_spd": 26,
												"cc": "SWE0",
												"stat": "mUKVmv",
												"msg_tp": "ENT",
												"pos_tm": ""
											},
											"type": "Feature",
											"geometry": {
												"type": "Point",
												"coordinates": [
													70.4716,
													8.7513
												]
											}
										}
									],
									"type": "FeatureCollection"
								}
							}
						},
						{
							title: 'spatial.layer_tree_segments',
							data: {
								excludeDnd: true,
								title: 'Segments',
								type: 'vmsseg',
								popupEnabled: true,
								geoJson:{
									"features": [
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 20,
												"trackId": "1",
												"dur": 18,
												"color": "#00FFFF",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 13,
												"crs_o_gnd": 7
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														69.4015,
														14.5006
													],
													[
														68.799,
														0.8752
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 15,
												"trackId": "1",
												"dur": 8,
												"color": "#660033",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 12,
												"crs_o_gnd": 13
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														69.453,
														5.1144
													],
													[
														69.3506,
														8.4189
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 8,
												"trackId": "1",
												"dur": 17,
												"color": "#00FFFF",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 8,
												"crs_o_gnd": 8
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														68.2698,
														-5.6394
													],
													[
														68.4217,
														7.4135
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 16,
												"trackId": "1",
												"dur": 9,
												"color": "#0000FF",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 14,
												"crs_o_gnd": 18
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														71.9848,
														-4.0537
													],
													[
														70.9983,
														1.8191
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 15,
												"trackId": "1",
												"dur": 0,
												"color": "#0000FF",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 5,
												"crs_o_gnd": 14
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														71.7219,
														-7.203
													],
													[
														66.5245,
														8.1637
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 18,
												"trackId": "1",
												"dur": 1,
												"color": "#990000",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 0,
												"crs_o_gnd": 20
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														70.4716,
														8.7513
													],
													[
														65.8078,
														6.5601
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 10,
												"trackId": "1",
												"dur": 15,
												"color": "#A3A385",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 7,
												"crs_o_gnd": 1
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														69.4908,
														-5.6578
													],
													[
														71.1272,
														6.9334
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 12,
												"trackId": "1",
												"dur": 10,
												"color": "#A3A385",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 11,
												"crs_o_gnd": 1
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														66.8897,
														0.0588
													],
													[
														67.6219,
														-4.6656
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 8,
												"trackId": "1",
												"dur": 2,
												"color": "#990000",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 3,
												"crs_o_gnd": 7
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														66.0596,
														8.0424
													],
													[
														67.3217,
														1.1735
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 6,
												"trackId": "1",
												"dur": 5,
												"color": "#CC66FF",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 0,
												"crs_o_gnd": 6
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														71.6157,
														12.5407
													],
													[
														64.9122,
														-1.4315
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 10,
												"trackId": "1",
												"dur": 11,
												"color": "#663300",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 18,
												"crs_o_gnd": 14
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														67.4419,
														10.6852
													],
													[
														68.3738,
														13.9743
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 2,
												"trackId": "1",
												"dur": 8,
												"color": "#0000FF",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 16,
												"crs_o_gnd": 20
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														71.7651,
														11.0498
													],
													[
														68.6219,
														14.281
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 13,
												"trackId": "1",
												"dur": 0,
												"color": "#669900",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 11,
												"crs_o_gnd": 11
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														66.9233,
														5.021
													],
													[
														68.2486,
														2.8863
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 8,
												"trackId": "1",
												"dur": 7,
												"color": "#660033",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 6,
												"crs_o_gnd": 18
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														69.7225,
														10.1027
													],
													[
														67.2995,
														3.367
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 19,
												"trackId": "1",
												"dur": 5,
												"color": "#00FFFF",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 1,
												"crs_o_gnd": 12
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														66.5214,
														8.3384
													],
													[
														70.6639,
														2.7391
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 17,
												"trackId": "1",
												"dur": 14,
												"color": "#00FFFF",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 2,
												"crs_o_gnd": 8
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														71.614,
														1.9222
													],
													[
														70.8722,
														8.4345
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 6,
												"trackId": "1",
												"dur": 7,
												"color": "#990000",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 6,
												"crs_o_gnd": 3
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														72.5099,
														9.9676
													],
													[
														69.6312,
														5.9909
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 15,
												"trackId": "1",
												"dur": 3,
												"color": "#A3A385",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 13,
												"crs_o_gnd": 4
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														70.1507,
														-1.1627
													],
													[
														70.0771,
														5.0839
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 8,
												"trackId": "1",
												"dur": 18,
												"color": "#0000FF",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 13,
												"crs_o_gnd": 9
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														71.5542,
														-7.2003
													],
													[
														69.5924,
														-2.222
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 10,
												"trackId": "1",
												"dur": 3,
												"color": "#FF0000",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 5,
												"crs_o_gnd": 15
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														70.7949,
														-6.2093
													],
													[
														71.1963,
														13.2849
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 9,
												"trackId": "1",
												"dur": 9,
												"color": "#663300",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 10,
												"crs_o_gnd": 14
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														64.821,
														-1.361
													],
													[
														68.0059,
														4.8815
													]
												]
											}
										},
										{
											"properties": {
												"guid": "",
												"cfr": "CFR0",
												"spd_o_gnd": 17,
												"trackId": "1",
												"dur": 1,
												"color": "#00FFFF",
												"name": "VESSEL-0",
												"ircs": "IRCS-0",
												"cc": "SWE0",
												"dist": 3,
												"crs_o_gnd": 16
											},
											"type": "Feature",
											"geometry": {
												"type": "LineString",
												"coordinates": [
													[
														71.2585,
														6.145
													],
													[
														65.5265,
														5.6752
													]
												]
											}
										}
									],
									"type": "FeatureCollection"
								}
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
											type: 'WMS',
											title: 'EEZ',
											isBaseLayer: false,
											attribution: 'Custom layer from UnionVMS',
											url: 'http://localhost:8080/geoserver/wms',
											serverType: 'geoserver',
											params: {
											    'LAYERS': 'uvms:eez',
											    'TILED': true,
											    'STYLES': 'eez'
											    //'cql_filter': "sovereign='Portugal' OR sovereign='Poland' OR sovereign='Bulgaria' OR sovereign='Belgium'"
											},
											contextItems: {
												header: {
													name: 'Style options',
													disabled: true,
													className: 'layer-menu-header'
												},
												styleA: {
													name: 'Labels and Geometry',
													type: 'radio',
													radio: 'style',
													value: 'eez_label_geom',
													selected: false
												},
												styleB: {
													name: 'Geometry only',
													type: 'radio',
													radio: 'style',
													value: 'eez',
													selected: true
												},
												styleC: {
													name: 'Labels only',
													type: 'radio',
													radio: 'style',
													value: 'eez_label',
													selected: false
												}
											}
										}
									},
									/*{ // development: local geoserver
										title: 'Test',
										data: {
											type: 'WMS',
											title: 'Test',
											isBaseLayer: false,
											attribution: 'This is a custom layer from UnionVMS',
											url: 'http://localhost:8080/geoserver/uvms/wms',
			                serverType: 'geoserver',
											opacity: 0.7,
			                params: {
			                    'LAYERS': 'uvms:countries',
			                    'TILED': true,
			                    'STYLES': 'polygon'
			                    //'cql_filter': "sovereign='Portugal' OR sovereign='Poland' OR sovereign='Bulgaria' OR sovereign='Belgium'"
			                },
											contextItems: {
												headerA: {
													name: 'Options',
													disabled: true,
													className: 'layer-menu-header'
												},
												styleA: {
													name: 'Polygon (default)',
													type: 'radio',
													radio: 'style',
													value: 'polygon',
													selected: true
												},
												styleB: {
													name: 'Giant polygon',
													type: 'radio',
													radio: 'style',
													value: 'giant_polygon',
													selected: false
												},
												styleC: {
													name: 'Grass',
													type: 'radio',
													radio: 'style',
													value: 'grass',
													selected: false
												},
												sepA: '-------',
												headerB: {
													name: 'More Options',
													disabled: true,
													className: 'layer-menu-header'
												},
												changeSource: {
													name: 'Change source',
													dev: true
												},
												addNode: {
													name: 'Add node',
													dev: true
												}
											}
										}
									},*/
									{
										title: 'RFMO',
										data: {
											type: 'WMS',
											isBaseLayer: false,
											title: 'RFMO',
											attribution: 'Custom layer from UnionVMS',
											url: 'http://localhost:8080/geoserver/wms',
											serverType: 'geoserver',
											params: {
													'LAYERS': 'uvms:rfmo',
													'TILED': true,
													'STYLES': ''
											},
											contextItems: {
												header: {
													name: 'Style options',
													disabled: true,
													className: 'layer-menu-header'
												},
	                      styleA: {
	                          name: 'Labels and Geometry',
	                          type: 'radio',
	                          radio: 'style',
	                          value: 'rfmo_label_geom',
	                          selected: false
	                      },
	                      styleB: {
	                          name: 'Geometry only',
	                          type: 'radio',
	                          radio: 'style',
	                          value: 'rfmo',
	                          selected: true
	                      },
	                      styleC: {
	                          name: 'Labels only',
	                          type: 'radio',
	                          radio: 'style',
	                          value: 'rfmo_label',
	                          selected: false
	                      }
	                    }
										}
									}
								]
							}
						]
					},
					{
						title: 'spatial.layer_tree_additional_cartography',
						folder: true,
						expanded: true,
						children: [
							{
								title: 'OpenSeaMap',
								data: {
								    type: 'OSEA',
								    isBaseLayer: false,
								    title: 'OpenSeaMap'
								}
							}
						]
					},
					{
						title: 'spatial.layer_tree_background_layers',
						folder: true,
						expanded: true,
						unselectable: true,
						hideCheckbox: true,
						extraClasses: 'layertree-baselayer-node',
						key: 'basemap',
						children: [
							{
								title: 'OpenStreetMap',
								selected: true,
								extraClasses: 'layertree-basemap',
								data: {
									type: 'OSM',
									isBaseLayer: true,
									title: 'OpenStreetMap'
								}
							},
							{
								title: 'Countries',
								extraClasses: 'layertree-basemap',
								data: {
									type: 'WMS',
									title: 'Countries',
								    isBaseLayer: true,
								    url: 'http://localhost:8080/geoserver/uvms/wms',
								    serverType: 'geoserver',
								    params: {
								        'LAYERS': 'uvms:countries',
								        'TILED': true,
								        'STYLES': 'polygon'
								    }
								}
							}
						]
					}
			];

			// /mocking source
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

			// initially create or update tree
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
							updateMap();
							//FIXME we might do this on a layer basis which would probably be better
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

				locale.ready( 'spatial' ).then( function() {
						setLocale();
				});
			};

			var setLocale = function() {
				$( '.fancytree-title' ).each( function( index ) {
					var key = this.firstChild.nodeValue;
					this.firstChild.nodeValue = locale.getString( key );
				});
			};

			createTree( scope.source );

			scope.$on( 'updateLayerTreeSource', updateLayerTreeSource );
			scope.$on( 'addLayerTreeNode', addLayerTreeNode );
		}
	};
});
