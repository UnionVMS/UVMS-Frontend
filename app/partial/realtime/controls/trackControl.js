
ol.control.TrackControl = function(opt_options){
        var options = opt_options || {};
        var this_ = this;

        var button = document.createElement('button');
        button.innerHTML = 'T';

        var element = document.createElement('div');
        element.className = 'track-control ol-unselectable ol-control';
        element.appendChild(button);

        var handleTrackControl = function(e){
            console.log('handle track control', options.layer);
            this_.getMap().getLayers().forEach(function(t) {
                    if(t.S.id === options.layer) {
                        t.setVisible(!t.getVisible());
                    }
            });
        };

        button.addEventListener('click', handleTrackControl, false);
        ol.control.Control.call(this, {
            element: element,
            target: options.target
        });


};
ol.inherits(ol.control.TrackControl, ol.control.Control);
