/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name comboboxService
 * @param $window {service} angular window service
 * @attr {Object} activeCombo - A property object that will be the scope of the current opened combobox
 * @attr {Object} selectedItemsGroup - A property object that will contain the lists of selected items for each combobox group(with shared combobox list)
 * @attr {Object} comboList - A property object that will contain the lists of items for each combobox group(with shared combobox list)
 * @description
 *  Service to manage all existent combobox(directive) in the application
 */
angular.module('unionvmsWeb').factory('comboboxService', function($window) {
	var cb = {};
	var activeCombo;
	var selectedItemsGroup = {};
	var comboList = {};
	
	/**
     * Check if the click event was triggered by clicking on any element whithin the active combobox
     * 
     * @memberof comboboxService
     * @private
     * @param {Event} evt
	 * @returns {Boolean} If the click happened over the active combobox
     */
	var clickedInSameCombo = function(event) {
		var isClickedElementChildOfPopup = activeCombo.element.find('.comboButtonContainer').find(event.target).length > 0 ||
		angular.element('#' + activeCombo.comboboxId).find(event.target).length > 0;

        return isClickedElementChildOfPopup;
	};

	/**
     * Positionate and resize the active combobox
     * 
     * @memberof comboboxService
     * @private
     */
	var positionComboList = function() {
    	if(activeCombo && activeCombo.isOpen){
            var relativePos = {'top':0,'left':0};
            if(activeCombo.destComboList){
                relativePos = $(activeCombo.destComboList).offset();
            }
            var comboButtonHeight = $(activeCombo.element).height();
            var buttonPosition = $(activeCombo.element).offset();
    		buttonPosition.top += comboButtonHeight - relativePos.top;
    		buttonPosition.left -= relativePos.left;
            
    		activeCombo.comboContainer = $('#' + activeCombo.comboboxId);
    		$(activeCombo.comboContainer).css('top', buttonPosition.top);
    		$(activeCombo.comboContainer).css('left', buttonPosition.left);
		
			$(activeCombo.comboContainer).width($(activeCombo.element).find('.comboButtonContainer').outerWidth());
    		
    		var comboMenu = $('#' + activeCombo.comboboxId + '>.dropdown-menu');
    		var footerTop = angular.element('footer').length>0 ? $($window).height() - angular.element('footer')[0].offsetHeight + $window.pageYOffset : $($window).height() + $window.pageYOffset;
    		var bottomSpace = footerTop - buttonPosition.top;
    		var topSpace = $(activeCombo.element).offset().top;
			//Fullscreen mode
    		if($('.fullscreen').length > 0){
    			bottomSpace = $(activeCombo.destComboList).height() - buttonPosition.top;
    			topSpace -= relativePos.top;
    		}

			var comboContainerHeight = activeCombo.loadedItems.length * 26 + 14;
			if(activeCombo.initialValue && activeCombo.initialValue.text && !activeCombo.noPlaceholderOnList && !activeCombo.multiple){
				comboContainerHeight += 26;
			}
			
			var maxComboHeight = parseInt(comboMenu.css('max-height'));
    		if((comboContainerHeight > maxComboHeight ? maxComboHeight : comboContainerHeight) > bottomSpace){
				// check if there's more space above or below the combobox
    			if(topSpace > bottomSpace){
    				var comboHeight = comboContainerHeight;
    				comboHeight = (comboHeight > maxComboHeight ? maxComboHeight + 4 : comboHeight);
					activeCombo.comboContainer.css('top', buttonPosition.top - comboButtonHeight - comboHeight);
    				if(topSpace < comboContainerHeight){
    					activeCombo.comboContainer.css('max-height', topSpace);
        			}
    			}else{
    				activeCombo.comboContainer.css('max-height', topSpace);
    			}
    		}
    	}
    };
    
	/**
     * Close active combobox and unbind all the related events
     * 
     * @memberof comboboxService
     * @private
     * @param {Event} evt
     */
    var closeCombo = function(evt) {
    	if(activeCombo){
			activeCombo.$apply(function(){
				activeCombo.isOpen = false;
			});
			$($(activeCombo.element).scrollParent()).off('scroll', closeCombo);
	        activeCombo = undefined;
    	}
		$($window).unbind('mousedown', closeCombo);
		$('[uib-modal-window]').unbind('mousedown', closeCombo);
		$($window).unbind('resize', closeCombo);
    };
    
	/**
     * Close active combobox
     * 
     * @memberof comboboxService
     * @public
	 * @alias closeCurrentCombo
     * @param {Event} evt
     */
    cb.closeCurrentCombo = function(evt){
		if(activeCombo){
			activeCombo.isOpen = false;
			cb.setActiveCombo(null);
		}
    };
	
	/**
     * Open combobox and bind all the related events (events that might close the combobox)
     * 
     * @memberof comboboxService
     * @public
	 * @alias setActiveCombo
     * @param {Object} comboScope
     */
	cb.setActiveCombo = function(comboScope){
		if(activeCombo && activeCombo !== comboScope){
			activeCombo.isOpen = false;
		}
		
		if(!activeCombo && comboScope){
			$('[uib-modal-window]').bind('mousedown', function(event){
            	if(activeCombo && activeCombo.isOpen) {
	                if (clickedInSameCombo(event)){
	                    return;
	                }
	                closeCombo();
            	}
            });
			$($window).bind('mousedown', function(event){
            	if(activeCombo && activeCombo.isOpen) {
	                if (clickedInSameCombo(event)){
	                    return;
	                }
	                closeCombo();
            	}
            });
    		$($window).bind('resize', closeCombo);
    		$($(comboScope.element).scrollParent()).scroll(closeCombo);
		}
		
		activeCombo = comboScope;
		positionComboList();
    };
	
	/**
     * Initialize a combobox group and add a new combobox to a specified group
     * 
     * @memberof comboboxService
     * @public
	 * @alias initializeGroup
	 * @param {String} groupName
     * @param {Object} combo
     */
	cb.initializeGroup = function(groupName,combo){
		if(!angular.isDefined(comboList[groupName])){
			comboList[groupName] = [];
		}
		
		comboList[groupName].push(combo);
		
		if(comboList[groupName].length<=1){
			selectedItemsGroup[groupName] = [];
		}
	};
	
	/**
     * Check if specified item is available to be selected in the list of the current combobox
     * 
     * @memberof comboboxService
     * @public
	 * @alias isAvailableItem
	 * @param {String} groupName
     * @param {Object} selectedItem
	 * @param {Object} item
	 * @returns {Boolean} If specified item wasn't selected by another combobox in the same group
     */
	cb.isAvailableItem = function(groupName, selectedItem, item){
		//check if the item was not selected in another combobox in the group or was selected on the current combobox
		if((angular.isDefined(selectedItemsGroup) && angular.isDefined(selectedItemsGroup[groupName]) && selectedItemsGroup[groupName].indexOf(item) === -1) || selectedItem === item){
			return true;
		}else{
			return false;
		}
	};
	
	/**
     * Update the list of combobox group(control what is visible for each combobox)
     * 
     * @memberof comboboxService
     * @public
	 * @alias updateComboListGroup
	 * @param {String} groupName
     * @param {Object} newVal
	 * @param {Object} oldVal
     */
	cb.updateComboListGroup = function(groupName, newVal, oldVal){
		if(angular.isDefined(selectedItemsGroup) && angular.isDefined(selectedItemsGroup[groupName])){
			if(angular.isDefined(oldVal) && selectedItemsGroup[groupName].indexOf(oldVal) !== -1){
				selectedItemsGroup[groupName].splice(selectedItemsGroup[groupName].indexOf(oldVal),1);
			}
			if(angular.isDefined(newVal)){
				selectedItemsGroup[groupName].push(newVal);
			}
		}
	};
	
	/**
     * Remove combobox from a group
     * 
     * @memberof comboboxService
     * @public
	 * @alias updateComboListGroup
	 * @param {String} groupName
     * @param {Object} scope
     */
	cb.removeCombo = function(groupName,scope){
		if(selectedItemsGroup[groupName].indexOf(scope.ngModel) !== -1){
			selectedItemsGroup[groupName].splice(selectedItemsGroup[groupName].indexOf(scope.ngModel),1);
		}
		
		for(var i=0;i<comboList[groupName].length;i++){
			if(comboList[groupName][i].comboboxId === scope.comboboxId){
				comboList[groupName].splice(i,1);
			}
		}
	};

	return cb;
});
 