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
angular.module('unionvmsWeb').factory('comboboxService', function($window) {
	var cb = {};
	var activeCombo;
	var selectedItemsGroup = {};
	var comboList = {};
	
	var clickedInSameCombo = function(event) {
		var isClickedElementChildOfPopup = activeCombo.element.find('.comboButtonContainer').find(event.target).length > 0 ||
		angular.element('#' + activeCombo.comboboxId).find(event.target).length > 0;

        return isClickedElementChildOfPopup;
	};

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
    		var footerTop = angular.element('footer').length>0 ? $(window).height() - angular.element('footer')[0].offsetHeight : $(window).height();
    		var bottomSpace = footerTop - buttonPosition.top;
    		var topSpace = $(activeCombo.element).offset().top;
    		if($('.fullscreen').length > 0){
    			bottomSpace = $(activeCombo.destComboList).height() - buttonPosition.top;
    			topSpace -= relativePos.top;
    		}

    		if((activeCombo.loadedItems.length * 26 > 300 ? 300 : activeCombo.loadedItems.length * 26) > bottomSpace){
    			if(topSpace > bottomSpace){
    				var comboHeight = activeCombo.loadedItems.length * 26 + 16;
    				comboHeight += (activeCombo.initialValue && activeCombo.initialValue.text ? 26 : 0);
    				comboHeight = (comboHeight > 300 ? 300 + 4 : comboHeight);
					activeCombo.comboContainer.css('top', buttonPosition.top - comboButtonHeight - comboHeight);
    				if(topSpace < activeCombo.loadedItems.length * 26){
    					activeCombo.comboContainer.css('max-height', topSpace);
        			}
    			}else{
    				activeCombo.comboContainer.css('max-height', topSpace);
    			}
    		}
    	}
    };
    
    var closeCombo = function(evt) {
    	if(activeCombo){
			if(angular.isDefined(evt)){
				activeCombo.isOpen = false;
			}else{
				activeCombo.$apply(function(){
					activeCombo.isOpen = false;
				});
			}
	    	if(activeCombo.componentsWithScroll){
	    		var scrollableElements = activeCombo.componentsWithScroll.split(',');
    			angular.forEach(scrollableElements, function(item) {
					$(item).off('scroll',closeCombo);
    			});
    		}
	        activeCombo = undefined;
    	}
		$($window).unbind('mousedown', closeCombo);
		$('[uib-modal-window]').unbind('mousedown', closeCombo);
		$($window).unbind('resize', closeCombo);
		$(window).off("scroll", closeCombo);
    };
    
    cb.closeCurrentCombo = function(evt){
    	closeCombo(evt);
    };
	
	cb.setActiveCombo = function(comboScope){
		if(activeCombo && activeCombo !== comboScope){
			activeCombo.isOpen = false;
		}
		
		if(!activeCombo){
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
    		
    		$(window).scroll(closeCombo);
    		if(comboScope.componentsWithScroll){
    			var scrollableElements = comboScope.componentsWithScroll.split(',');
    			angular.forEach(scrollableElements, function(item) {
					$(item).scroll(closeCombo);
    			});
    		}
		}
		
		activeCombo = comboScope;
		positionComboList();
    };
	
	cb.initializeGroup = function(groupName,combo){
		if(!angular.isDefined(comboList[groupName])){
			comboList[groupName] = [];
		}
		
		comboList[groupName].push(combo);
		
		if(comboList[groupName].length<=1){
			selectedItemsGroup[groupName] = [];
		}
	};
	
	cb.isAvailableItem = function(groupName, selectedItem, item){
		if((angular.isDefined(selectedItemsGroup) && angular.isDefined(selectedItemsGroup[groupName]) && selectedItemsGroup[groupName].indexOf(item) === -1) || selectedItem === item){
			return true;
		}else{
			return false;
		}
	};
	
	cb.updateComboListGroup = function(groupName, newVal, oldVal){
		if(angular.isDefined(oldVal) && selectedItemsGroup[groupName].indexOf(oldVal) !== -1){
			selectedItemsGroup[groupName].splice(selectedItemsGroup[groupName].indexOf(oldVal),1);
		}
		if(angular.isDefined(newVal)){
			selectedItemsGroup[groupName].push(newVal);
		}
	};
	
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