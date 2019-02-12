var TrackControl = (function (Control) {
    function TrackControl(opt_options) {
      var options = opt_options || {};

      var button = document.createElement('button');
      button.innerHTML = 'T';

      var element = document.createElement('div');
      element.className = 'track-control ol-unselectable ol-control';
      element.appendChild(button);

      Control.call(this, {
        element: element,
        target: options.target
      });

      button.addEventListener('click', this.handleTrackControl.bind(this), false);
    }

    if ( Control ) TrackControl.__proto__ = Control;
    TrackControl.prototype = Object.create( Control && Control.prototype );
    TrackControl.prototype.constructor = handleTrackControl;

    TrackControl.prototype.handleTrackControl = function handleTrackControl() {

    };

    return TrackControl;
}(Control));
