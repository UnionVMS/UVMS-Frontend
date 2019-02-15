
ol.control.InfoControl = function(opt_options){
        var options = opt_options || {};
        var this_ = this;

        var button = document.createElement('button');
        button.innerHTML = 'i';

        var element = document.createElement('div');
        element.className = 'info-control ol-unselectable ol-control';
        element.appendChild(button);

        var handleInfoControl = function(e){
            console.log('handle info control', options.layer);
            this_.getMap().getLayers().forEach(function(t) {
                    if(t.S.id === options.layer) {
                        t.setVisible(!t.getVisible());
                    }
            });
        };

        button.addEventListener('click', handleInfoControl, false);
        ol.control.Control.call(this, {
            element: element,
            target: options.target
        });


};
ol.inherits(ol.control.InfoControl, ol.control.Control);
