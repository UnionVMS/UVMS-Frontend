angular.module('unionvmsWeb').factory('comboboxService', function($window) {
	var cb = {};
	var activeCombo;
	var clickedInSameCombo = function(event) {
		var isClickedElementChildOfPopup = activeCombo.element.find(event.target).length > 0 ||
		angular.element('#' + activeCombo.comboboxId).find(event.target).length > 0;

	    if (isClickedElementChildOfPopup){
	        return true;
	    }
	};

	var positionComboList = function() {
    	if(activeCombo && activeCombo.isOpen){
            var relativePos = 0;
            var buttonPosition = $(activeCombo.element).offset();
    		buttonPosition.top += $(activeCombo.element).height();
            if(activeCombo.destComboList){
                relativePos = $(activeCombo.destComboList).offset().top;
            }
    		activeCombo.comboContainer = $('#' + activeCombo.comboboxId);
    		$(activeCombo.comboContainer).css('top', buttonPosition.top - relativePos);
    		$(activeCombo.comboContainer).css('left', buttonPosition.left);
		
			$(activeCombo.comboContainer).width($(activeCombo.element).width());
    		
    		var comboMenu = $('#' + activeCombo.comboboxId + '>.dropdown-menu');
    		var footerTop = $(window).height() - angular.element('footer')[0].offsetHeight;
    		var bottomSpace = footerTop - buttonPosition.top;

    		var topSpace = $(activeCombo.element).offset().top;
    		
    		if($(activeCombo.element).height() > bottomSpace){
    			if(topSpace > bottomSpace){
    				activeCombo.comboContainer.css('top', topSpace - relativePos);
    				if(topSpace < $(activeCombo.element).height()){
    					activeCombo.comboContainer.css('height', topSpace);
        			}
    			}else{
    				activeCombo.comboContainer.css('height', topSpace);
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
