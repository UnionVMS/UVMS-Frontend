
class AnimatedMarker {

    constructor(map, marker, speed, routeCoords) {
        this.map = map;
        this.marker = marker;
        this.markerStyle = this.marker.getStyle();
        this.vesselAnimationSpeed = speed;
        this.now = Date.now();
        this.animating = false;
        this.routeCoords = routeCoords;
    }

    moveFeature() {
        var vectorContext = event.vectorContext;
        var frameState = event.frameState;

        if (this.animating) {
            let elapsedTime = frameState.time - this.now;
            let index = Math.round(this.vesselAnimationSpeed * elapsedTime / 1000);

            if (index >= this.routeCoords.length) {
                this.stopAnimation(true);
                return;
            }

            let currentPoint = new Point(this.routeCoords[index]);
            let feature = new Feature(currentPoint);
            vectorContext.drawFeature(feature, this.markerStyle);
        }
        this.map.render();  // todo, don't reference this from inside here, trigger an event instead
    }

    startAnimation() {
        if (this.animating) {
            this.stopAnimation(false);
        } else {
            this.animating = true;
            this.now = new Date().getTime();
            // hide geoMarker
            this.marker.setStyle(null);
            this.map.on('postcompose', this.moveFeature);
            this.map.render();
        }
    }

    stopAnimation(ended) {
        this.animating = false;

        // if animation cancelled set the marker at the beginning
        let coord = ended ? this.routeCoords[this.routeCoords.length - 1] : this.routeCoords[0];
        (this.marker.getGeometry()).setCoordinates(coord);
        //remove listener
        this.map.un('postcompose', this.moveFeature);
    }

}

