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

					if ( node && node.data.mapLayer && input.hasOwnProperty( 'style' ) ) {
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

			scope.setupRadioButton = function( item, node ){
				if ( !item.hasOwnProperty( 'radio' ) || item.radio !== 'style' ) {
					return;
				}

				item.events = {
					click: scope.radioButtonClickHandler
				};
			};

			// handler for 'regular' items - (type === undefined)
			// currently only for development
			scope.clickHandler = function ( key, options ) {
				if ( !options.commands[ key ].dev ) {
					return;
				}
			};

			$.contextMenu({
				selector: '.layertree-menu > span',
				trigger: 'left',
				build: function( $trigger, e ) {
					var rootProp, item,
							node = $.ui.fancytree.getNode( $trigger.context ),
							items = node.data.contextItems;

					// setup listeners
					for ( rootProp in items ) {
						if ( !items.hasOwnProperty( rootProp ) ) {
							continue;
						}

						item = items[ rootProp ];

						scope.setupRadioButton( item, node );
					}

					return {
						callback: scope.clickHandler,
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
