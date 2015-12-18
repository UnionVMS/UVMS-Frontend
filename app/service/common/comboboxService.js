angular.module('unionvmsWeb').factory('comboboxService', function($window) {
	var cb = {};
	var activeCombo;
	var clickedInSameCombo = function() {
		var isClickedElementChildOfPopup = activeCombo.element.find(event.target).length > 0 ||
		angular.element('#' + activeCombo.comboboxId).find(event.target).length > 0;

	    if (isClickedElementChildOfPopup){
	        return true;
	    }
	}

	var positionComboList = function() {
    	if(activeCombo.isOpen){
    		var buttonPosition = $(activeCombo.element).offset();
    		buttonPosition.top += $(activeCombo.element).height();
    		activeCombo.comboContainer = $('#' + activeCombo.comboboxId);
    		$(activeCombo.comboContainer).css('top', buttonPosition.top);
    		$(activeCombo.comboContainer).css('left', buttonPosition.left);
    		setTimeout(function() {
    				$(activeCombo.comboContainer).width($(activeCombo.element).width());
    		}, 25);
    		
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
	
	cb.setActiveCombo = function(comboScope){
		if(activeCombo && activeCombo !== comboScope){
			activeCombo.isOpen = false;
		}
		
		if(!activeCombo){
			$('[modal-window]').bind('click', function(event){
            	if(activeCombo.isOpen) {
	                if (clickedInSameCombo()){
	                    return;
	                }
	
	                activeCombo.$apply(function(){
	                	activeCombo.isOpen = false;
	                });
	                activeCombo = undefined;
	    			$($window).unbind('click');
	    			$('[modal-window]').unbind('click');
	        		$($window).unbind('resize');
            	}
            });
			$($window).bind('click', function(event){
            	if(activeCombo.isOpen) {
	                if (clickedInSameCombo()){
	                    return;
	                }
	
	                activeCombo.$apply(function(){
	                	activeCombo.isOpen = false;
	                });
	                activeCombo = undefined;
	    			$($window).unbind('click');
	    			$('[modal-window]').unbind('click');
	        		$($window).unbind('resize');
            	}
            });
    		$($window).bind('resize', positionComboList);
		}else{
	        if (clickedInSameCombo()){
	            return;
	        }
		}
		
		activeCombo = comboScope;
		
		positionComboList();
    };

	return cb;
});
