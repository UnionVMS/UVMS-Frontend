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
	    		var buttonPosition = $(activeCombo.element).offset();
	    		buttonPosition.top += $(activeCombo.element).height();
	    		activeCombo.comboContainer = $('#' + activeCombo.comboboxId);
	    		$(activeCombo.comboContainer).css('top', buttonPosition.top);
	    		$(activeCombo.comboContainer).css('left', buttonPosition.left);
    		
				$(activeCombo.comboContainer).width($(activeCombo.element).width());
    		
    		var comboMenu = $('#' + activeCombo.comboboxId + '>.dropdown-menu');
    		var footerTop = $(window).height() - angular.element('footer')[0].offsetHeight;
    		var bottomSpace = footerTop - buttonPosition.top;
    		var topSpace = $(activeCombo.element).offset().top;
    		
    		if(parseInt(comboMenu.css('max-height')) > bottomSpace){
    			if(topSpace > bottomSpace){
    				activeCombo.comboContainer.css('top', topSpace - comboMenu.height() - 15);
    				if(topSpace < comboMenu.css('max-height')){
    					activeCombo.comboContainer.css('height', topSpace);
        			}
    			}else{
    				activeCombo.comboContainer.css('height', topSpace);
    			}
    		}
    	}
    };
    
    var closeCombo = function() {
    	activeCombo.$apply(function(){
        	activeCombo.isOpen = false;
        });
        activeCombo = undefined;
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
		}else{
	        if (clickedInSameCombo(event)){
	            return;
	        }
		}
		
		activeCombo = comboScope;
		positionComboList();
    };

	return cb;
});
