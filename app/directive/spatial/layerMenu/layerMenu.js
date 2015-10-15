angular.module('unionvmsWeb').directive('layerMenu', function() {
	return {
		restrict: 'A',
		templateUrl: 'directive/spatial/layerMenu/layerMenu.html',
		// controller ? MV*
		link: function(scope, element, attrs, fn) {
			// hide contextmenu to have hide handler invoked
			scope.radioButtonClickHandler = function ( event ) {
				event.data.$menu.trigger("contextmenu:hide");
			};

			//
			scope.hideHandler = function( opt ) {
					var items,
							node = $.ui.fancytree.getNode( this.context ),
							input = $.contextMenu.getInputValues( opt, this.data() );

					if ( node.data.mapLayer && input.hasOwnProperty( 'style' ) ) {
						var tileSource = node.data.mapLayer.getSource();
						tileSource.updateParams( {'STYLES': input.style} );
						items = node.data.contextItems;
						jQuery.each( items, function( key, value ) {
								if ( !value.hasOwnProperty( 'radio' ) || value.radio !== 'style' ) {
									return true;
								}
								value.selected = value.value === input.style;
						});
					}
			};

			$.contextMenu({
				selector: '.layertree-menu > span',
				trigger: 'left',
				build: function( $trigger, e ) {
					var rootProp, item,
							node = $.ui.fancytree.getNode( $trigger.context ),
							items = node.data.contextItems;

					// check items for -> radio: 'style', add listener
					for ( rootProp in items ) {
						if ( !items.hasOwnProperty( rootProp ) ) {
							continue;
						}

						item = items[ rootProp ];

						if ( !item.hasOwnProperty( 'radio' ) || item.radio !== 'style' ) {
							continue;
						}

						if ( !node.data.mapLayer ) {
							item.disabled = true;
							continue;
						}

						item.disabled = false;
						item.events = {
							click: scope.radioButtonClickHandler
						};
					}

					return {
						callback: function( key, options ) {
							// stub, default callback for none-input commands
							//var node = $.ui.fancytree.getNode( this.context );
						},
						events: {
							show: function( opt ) {
								// stub
							},
							hide: scope.hideHandler
						},
						items: node.data.contextItems
					};
				}
			});
		}
	};
});
