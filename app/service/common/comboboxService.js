angular.module('unionvmsWeb').factory('comboboxService', function($window) {
	var cb = {};
	var activeCombo;
	var clickedInSameCombo = function(event) {
		var isClickedElementChildOfPopup = activeCombo.element.find('button.dropdown-toggle').find(event.target).length > 0 ||
		angular.element('#' + activeCombo.comboboxId).find(event.target).length > 0;

	    if (isClickedElementChildOfPopup){
	        return true;
	    }
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
		
			$(activeCombo.comboContainer).width($(activeCombo.element).find('.dropdown-toggle').outerWidth());
    		
    		var comboMenu = $('#' + activeCombo.comboboxId + '>.dropdown-menu');
    		var footerTop = $(window).height() - angular.element('footer')[0].offsetHeight;
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
    
    var closeCombo = function() {
    	if(activeCombo){
	    	activeCombo.$apply(function(){
	        	activeCombo.isOpen = false;
	        });
	        activeCombo = undefined;
    	}
		$($window).unbind('mousedown');
		$('[uib-modal-window]').unbind('mousedown');
		$($window).unbind('resize');
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
		}
		
		activeCombo = comboScope;
		positionComboList();
    };

	return cb;
});
