/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').directive('layerMenu', function(locale) {
	return {
		restrict: 'A',
		templateUrl: 'directive/spatial/layerMenu/layerMenu.html',
		// controller ? MV*
		link: function(scope, element, attrs, fn) {
			// hide contextmenu
			scope.hideMenu = function (event) {
				event.data.$menu.trigger("contextmenu:hide");
			};

			//Change layer styles
			scope.changeStyles = function(event){
                var node = $.ui.fancytree.getNode(event.data.$trigger);
                var input = $.contextMenu.getInputValues(event.data, event.data.$selected.data());
                
                if (node && node.data.mapLayer && input.hasOwnProperty('style')){
                    var def = node.data.contextItems[input.contextMenuKey];
                    var tileSource = node.data.mapLayer.getSource();
                    tileSource.updateParams( {'STYLES': input.style} );
                    
                    var items = _.filter(node.data.contextItems, {radio: 'style'});
                    
                    for (var i = 0; i < items.length; i++){
                        var status = false;
                        if (items[i].value === input.style){
                            status = true;
                        }
                        items[i].selected = status;
                    }
                    
                    scope.$parent.$broadcast('reloadLegend');
                }
            };
			
			//Change cql filters for user area groups layer
			scope.changeFilters = function(event){
			    var node = $.ui.fancytree.getNode(event.data.$trigger);
			    var input =$.contextMenu.getInputValues(event.data, event.data.$selected.data());
			    
			    if (node && node.data.mapLayer && input.hasOwnProperty('filter')){
			        var def = node.data.contextItems[input.contextMenuKey];
			        var tileSource = node.data.mapLayer.getSource();
			        tileSource.updateParams( {'cql_filter': def.cql} );
			        
			        var items = _.filter(node.data.contextItems, {radio: 'filter'});
			        
			        for (var i = 0; i < items.length; i++){
			            var status = false;
			            if (items[i].value === input.contextMenuKey){
			                status = true;
			            }
			            items[i].selected = status;
			        }
			    }
			};

			scope.setupRadioButton = function( item, node ){
				if ( !item.hasOwnProperty( 'radio' ) ) {
					return;
				}
				
				if (item.radio === 'style'){
				    item.events = {
	                    click: scope.changeStyles
	                };
				} else {
				    item.events = {
                        click: scope.changeFilters
                    };
				}
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
					
					var quit = {
		                quitMenu: {
		                    name: locale.getString('spatial.layer_tree_context_menu_quit_title'),
		                    icon: function(opt, $itemElement, itemKey, item){
		                        $itemElement.html('<span class="fa fa-times" aria-hidden="true"></span>' + item.name);
		                        return 'context-menu-icon-quit';
		                    },
		                    events: {
		                        click: scope.hideMenu
		                    }
		                }
		            };
			        _.extend(node.data.contextItems, quit);

					return {
						callback: scope.clickHandler,
						items: node.data.contextItems
					};
				}
			});
		}
	};
});