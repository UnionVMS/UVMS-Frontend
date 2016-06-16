//OL Navigation History custom control - mapservice
ol.control.HistoryControl = function(opt_options){
    var options = opt_options || {};

    var this_ = this;

    this_.backBtn = document.createElement('button');
    this_.backBtn.className = 'ol-history-back';
    this_.backBtn.title = options.backLabel;
    var backIcon = document.createElement('span');
    backIcon.className = 'fa fa-long-arrow-left';
    backIcon.style.fontSize = '13px';
    this_.backBtn.appendChild(backIcon);


    this_.forwardBtn = document.createElement('button');
    this_.forwardBtn.className = 'ol-history-forward';
    this_.forwardBtn.title = options.forwardLabel;
    var forwardIcon = document.createElement('span');
    forwardIcon.className = 'fa fa-long-arrow-right';
    forwardIcon.style.fontSize = '13px';
    this_.forwardBtn.appendChild(forwardIcon);

    this_.historyArray = [];
    this_.historyLimit = 50;
    this_.updateByClick = false;

    //Calculate map state object describing the map view state
    this_.calculateMapState = function(){
        var view = this_.getMap().getView();
        var center = view.getCenter();
        return {
            zoom:  view.getZoom(),
            center: {
                x: Math.round(center[0] * 100) / 100,
                y: Math.round(center[1] * 100) / 100
            }
        };
    };

    //Update history array
    this_.updateHistory = function(){
        if (this_.updateByClick === false){
            var newMapState = this_.calculateMapState();
            if (typeof this_.historyIndex === 'undefined'){
                this_.historyArray.push(newMapState);
                this_.historyIndex = 0;
            } else {
                var oldMapState = this_.getMapState(this_.historyIndex);
                //Check if the new state is not equal to the current index (we need this to avoid
                // pushing new states when the screen is being resized)
                if (this_.compareMapState(oldMapState, newMapState) === false){
                    if (this_.historyIndex < this_.historyArray.length - 1){
                        this_.historyArray.splice(this_.historyIndex + 1, this_.historyArray.length - 1 - this_.historyIndex);
                    }
                    this_.historyArray.push(newMapState);
                    this_.historyIndex += 1;
                }
                this_.checkHistoryLength();
            }
        } else {
            this_.updateByClick = false;
        }
    };

    //Get the state object of the map at the specified index
    this_.getMapState = function(idx){
        return this_.historyArray[idx];
    };

    //Check if new map state is equal to the current history index state
    this_.compareMapState = function(oldState, newState){
        var isEqual = true;
        for (var key in oldState){
            var value = oldState[key];
            if (typeof value === 'object'){
                if (value.x !== newState[key].x || value.y !== newState[key].y){
                    isEqual = false;
                }
            } else {
                if (value !== newState[key]){
                    isEqual = false;
                }
            }
        }

        return isEqual;
    };

    //Check length of history array and remove items if needed
    this_.checkHistoryLength = function(){
        if (this_.historyArray.length > this_.historyLimit){
            this_.historyArray.shift();
            if (this_.historyIndex !== 0){
                this_.historyIndex -= 1;
            }
        }
    };

    //Set map view by index
    this_.setMapView = function(idx){
        this_.updateByClick = true;
        var view = this_.getMap().getView();
        var viewData = this_.getMapState(idx);
        view.setZoom(viewData.zoom);
        view.setCenter([viewData.center.x, viewData.center.y]);
    };

    //Click event listeners for the buttons
    var backClick = function(e){
        if (this_.historyIndex > 0){
            this_.setMapView(this_.historyIndex - 1);
            this_.historyIndex -= 1;
        }
    };

    var forwardClick = function(e){
        if (this_.historyIndex < this_.historyArray.length - 1){
            this_.setMapView(this_.historyIndex + 1);
            this_.historyIndex += 1;
        }
    };

    this_.backBtn.addEventListener('click', backClick, false);
    this_.forwardBtn.addEventListener('click', forwardClick, false);

    var element = document.createElement('div');
    element.className = 'ol-history ol-unselectable ol-control';
    element.appendChild(this_.backBtn);
    element.appendChild(this_.forwardBtn);

    ol.control.Control.call(this, {
        element: element,
        target: options.target
    });
};
ol.inherits(ol.control.HistoryControl, ol.control.Control);

ol.control.HistoryControl.prototype.resetHistory = function(){
    this.historyArray = [];
    this.historyIndex = undefined;
};

// Reset control for area management map - areamapservice 
ol.control.ResetLayerFilter= function(opt_options){
    var options = opt_options || {};
    var className = options.controlClass ? options.controlClass : undefined;
    
    var btn = document.createElement('button');
    btn.title = options.label;
    var icon = document.createElement('span');
    icon.className = 'fa fa-refresh';
    icon.style.fontSize = '13px';
    btn.appendChild(icon);
    
    var this_ = this;
    
    var resetFilterAreaMapService = function(e){
        var layers = this_.getMap().getLayers();
        if (layers.getLength() > 1){
            layers = layers.getArray().filter(function(layer){
                return layer.get('type') !== 'osm' && layer.getSource() instanceof ol.source.TileWMS && layer.get('visible') === true;
            });
            
            for (var i = 0; i < layers.length; i++){
                var cql;
                var baseCql = layers[i].get('baseCql');
                if (angular.isDefined(baseCql)){ //USER AREAS and USER AREAS GROUPS
                    cql = baseCql;
                    var groupCql = layers[i].get('groupCql');
                    if (angular.isDefined(groupCql)){
                        cql += groupCql;
                    }
                } else {
                    cql = null;
                }
                
                if (angular.isDefined(cql)){
                    layers[i].getSource().updateParams({
                        time_: (new Date()).getTime(),
                        'cql_filter': cql
                    });
                }
            }
        }
    };
    
    var resetFilterAreaSelectionModal = function(e){
        var layers = this_.getMap().getLayers();
        if (layers.getLength() > 1){
            var layer = layers.getArray().find(function(layer){
                return layer.get('type') !== 'osm';
            });
            
            var cql = null;
            if (layer.get('type') === 'USERAREA'){
                var currentPams = layer.getSource().getParams();
                var cqlComps = currentPams.cql_filter.split(' and');
                cql = cqlComps[0];
            }
            
            layer.getSource().updateParams({
                'cql_filter': cql
            });
        }
    };
    
    if (options.type === 'areamapservice'){
        btn.addEventListener('click', resetFilterAreaMapService, false);
    } else if (options.type === 'areaselectionmodal'){
        btn.addEventListener('click', resetFilterAreaSelectionModal, false);
    }
    
    
    var element = document.createElement('div');
    element.className = 'ol-resetCql ol-unselectable ol-control ';
    if (className){
        element.className += className;
    } else {
        element.className += 'ol-resetCql-default';
    }
    element.appendChild(btn);
    
    ol.control.Control.call(this, {
        element: element,
        target: options.target,
    });
};
ol.inherits(ol.control.ResetLayerFilter, ol.control.Control);