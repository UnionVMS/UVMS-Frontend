angular.module('unionvmsWeb').directive("vesselDropdown", function(mapService, reportService) {
    return {
        restrict: "E",
        templateUrl: "partial/spatial/reportsPanel/reportForm/vesselDropdown/vesselDropdown.html",
        scope: {},
        link: function(scope) {
            scope.listVisible = false;
            scope.selected = undefined;

            scope.select = function(item) {
                scope.selected = item;
                scope.listVisible = false;
                scope.panTo(item.coordinates);
            };

            scope.panTo = function(coordinates) {
                var coords = ol.proj.transform(coordinates, 'EPSG:4326', mapService.getMapProjectionCode());
                mapService.panTo(coords);
                var geom = new ol.geom.Point(coords);
                geom.set('GeometryType', 'Point');
                mapService.highlightFeature(geom);
            };

            scope.isSelected = function(item) {
                if(scope.selected) {
                  return item === scope.selected;
                }
            };

            scope.show = function() {
                scope.listVisible = !scope.listVisible;
            };

            scope.$watch("selected", function(value) {
                if(scope.selected){
                    scope.display = scope.selected.name;
                }
            });

            scope.clearSelection = function(event) {
                event.stopPropagation();
                scope.selected = undefined;
                scope.listVisible = false;
            };

            scope.vesselsFromMovements = [];

            scope.$watch(function() { return reportService.getPositions(); }, function(positions) {
                if(!angular.equals([], positions)) {
                    positions.sort(function(a,b) {
                        return (a.properties.positionTime < b.properties.positionTime) ? 1 : ((b.properties.positionTime < a.properties.positionTime) ? -1 : 0)
                    });
                    angular.forEach(positions, function (position) {
                        var existingVessel = includesVessel(position.properties);
                        if(existingVessel){
                            if(existingVessel.positionTime < position.properties.positionTime) {
                                existingVessel.coordinates = position.geometry.coordinates;
                                existingVessel.positionTime = position.properties.positionTime;
                            }
                        } else {
                            scope.vesselsFromMovements.push({"coordinates" : position.geometry.coordinates,
                                "positionTime" : position.properties.positionTime,
                                "name" : position.properties.name,
                                "cfr" : position.properties.cfr,
                                "ircs" : position.properties.ircs,
                                "externalMarking" : position.properties.externalMarking,
                                "iccat" : position.properties.iccat});
                        }
                    });
                    if(scope.selected) {
                        scope.panTo(scope.selected.coordinates);
                    }
                }
            }, true);

            var includesVessel = function(vesselProperties) {
                var vessel = undefined;
                angular.forEach(scope.vesselsFromMovements, function (entry) {
                    if( entry.name === vesselProperties.name &&
                        entry.cfr === vesselProperties.cfr &&
                        entry.ircs === vesselProperties.ircs &&
                        entry.externalMarking === vesselProperties.externalMarking &&
                        entry.iccat === vesselProperties.iccat) {

                        vessel = entry;
                    }
                });
                return vessel;
            };
        }
    }
});
