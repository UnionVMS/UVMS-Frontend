angular.module('unionvmsWeb').controller('UploadareamodalCtrl',function($scope, $modalInstance, locale, FileUploader, projections, srcProjections, defaultProjection, $timeout){
    $scope.hasError = false;
    $scope.hasWarning = false;
    $scope.errorMessage = undefined;
    
    $scope.uploader = new FileUploader();
    $scope.reader = new FileReader();
    $scope.srcProjections = srcProjections;
    $scope.projections = projections;
    $scope.defaultProjection = defaultProjection; //This is an array like [1, 'EPSG:4326']
    
    if ($scope.projections.length > 0){
        $scope.selProjection = defaultProjection[0];
    }
    
    //Uploader Filters and events
    $scope.uploader.filters.push({
       name: 'singleUpload',
       fn: function(item){
           if (this.queue.length > 0){
               this.queue.pop();
           }
           return item;
       }
    });
    
    $scope.uploader.filters.push({
       name: 'fileExtension',
       fn: function(item){
           var supportedTypes = ['csv', 'txt', 'wkt'];
           var splitedItemName = item.name.split('.');
           
           for (var i = 0; i < supportedTypes.length; i++){
               if (supportedTypes[i].toLowerCase() === splitedItemName[splitedItemName.length - 1].toLowerCase()){
                   return item;
               }
           }
       }
    });
    
    //Read uploaded file contents
    $scope.uploader.onAfterAddingFile = function(item) {
        $scope.isFileLoading = true;
        try {
            $scope.reader.readAsText(item._file);
        } catch (e) {
            $scope.fileCommitted = true;
            $scope.fileReadingSuccess = false;
            $scope.isFileLoading = false;
        }
    };
    
    //Set intial status
    $scope.setStatus = function(){
        $scope.fileCommitted = false;
        $scope.isFileLoading = false;
        $scope.fileReadingSuccess = true;
        if ($scope.uploader.queue.length > 0){
            $scope.uploader.clearQueue();
            $scope.fileContent = undefined;
        }
    };
    $scope.setStatus();
    
    //Reader events
    $scope.reader.onloadend = function(){
        $scope.fileContent =  $scope.reader.result;
        $scope.isFileLoading = false;
        $scope.fileReadingSuccess = true;
        $scope.fileCommitted = true;
    };
    
    //Format combobox
    $scope.format = 'csv';
    $scope.formatItems = [];
    $scope.formatItems.push({"text": locale.getString('areas.area_upload_modal_csv'), "code": "csv"});
    $scope.formatItems.push({"text": locale.getString('areas.area_upload_modal_wkt'), "code": "wkt"});
    //$scope.formatItems.push({"text": locale.getString('areas.area_upload_modal_gml'), "code": "gml"});
    
    //CSV stuff
    $scope.containsFirstRow = false;
    
    //CSV delimiters combobox
    $scope.delimiter = ',';
    $scope.delimiterItems = [];
    $scope.delimiterItems.push({"text": locale.getString('areas.area_upload_modal_comma'), "code": ","});
    $scope.delimiterItems.push({"text": locale.getString('areas.area_upload_modal_semicolon'), "code": ";"});
    $scope.delimiterItems.push({"text": locale.getString('areas.area_upload_modal_colon'), "code": ":"});
    
    //CSV parser
    $scope.parseCSV = function(){
        var lines = $scope.fileContent.split('\n');
        var columns = lines[0].split($scope.delimiter).length;
        
        var start = 0;
        var headers = [];
        if ($scope.containsFirstRow){
            headers = lines[0].split($scope.delimiter);
            start = 1;
        } else {
            if (columns !== 2){
                $scope.errorMessage = locale.getString('areas.area_upload_modal_only_two_columns');
                $scope.setError();
                return;
            }
        }
        
        var coords = [];
        for (var i = start; i < lines.length; i++){
            var currentLine = lines[i].split(new RegExp($scope.delimiter+'(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)'));
            if (currentLine.length === columns){
                var x,y;
                if (!$scope.containsFirstRow){
                    x = parseFloat(currentLine[0]);
                    y = parseFloat(currentLine[1]);
                } else {
                    for (var j = 0; j < headers.length; j++){
                        if (headers[j].trim() === $scope.xField.trim()){
                            x = parseFloat(currentLine[j]);
                        } else if (headers[j].trim() === $scope.yField.trim()){
                            y = parseFloat(currentLine[j]);
                        }
                    }
                }
                if (x && y && !isNaN(x) && !isNaN(y)){
                    coords.push([x,y]);
                }
            }
        }
        
        if (coords.length !== 0){
            //Lets validate if last pair of coordinates is the same as the first and if not we add it
            var firstCoord = coords[0];
            var lastCoord = coords[coords.length - 1];
            var diff = _.difference(firstCoord, lastCoord);
            
            if (diff.length > 0){
                coords.push(firstCoord);
            }
            
            //Build geometry
            var geom = new ol.geom.Polygon();
            geom.setCoordinates([coords]);
            
            geom = $scope.checkAndWarpGeometry(geom);
            
            return geom;
        } else {
            $scope.errorMessage = locale.getString('areas.area_upload_modal_parsing_error');
            $scope.setError();
            return;
        }
    };
    
    //WKT Parser
    $scope.parseWKT = function(){
        var isMulti = false;
        if ($scope.fileContent.indexOf('POLYGON') === -1){
            $scope.errorMessage = locale.getString('areas.area_upload_modal_wkt_no_polygon');
            $scope.setError();
            return;
        }
        
        if ($scope.fileContent.indexOf('MULTIPOLYGON') !== -1){
            $scope.errorMessage = locale.getString('areas.area_upload_modal_wkt_no_multipolygon'); 
            $scope.setWarning();
            isMulti = true;
        }
        
        if (isMulti){
            $timeout(function(){
                return $scope.buildGeometryFromWKT(isMulti);
            }, 3000);
        } else {
            return $scope.buildGeometryFromWKT(isMulti);
        }
    };
    
    $scope.buildGeometryFromWKT = function(isMulti){
        var geomFormat = new ol.format.WKT();
        var srcProj = $scope.getEpsgById($scope.selProjection);
        
        try {
            var geom = geomFormat.readGeometry($scope.fileContent, {
                dataProjection: srcProj,
                featureProjection: $scope.defaultProjection[1]
            });
            
            if (isMulti){
                geom = geom.getPolygon(0);
                $modalInstance.close(geom);
            }
            
            return geom;
        } catch (e) {
            $scope.errorMessage = locale.getString('areas.area_upload_modal_parsing_error_wkt');
            $scope.setError();
            return; 
        }
    };
    
    //Check if selected projection differs from that of the map and, if so, warp it
    $scope.checkAndWarpGeometry = function(geom){
        var sourceProj = $scope.getEpsgById($scope.selProjection);
        if (sourceProj !== $scope.defaultProjection[1]){
            geom.transform(sourceProj, $scope.defaultProjection[1]);
        }
        return geom;
    };
    
    //Geometry and projection functions
    $scope.getEpsgById = function(id){
        for (var i = 0; i < $scope.srcProjections.length; i++){
            if ($scope.srcProjections[i].id === id){
                return 'EPSG:' + $scope.srcProjections[i].epsgCode; 
            }
        }
    };
    
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    $scope.upload = function(){
        $scope.uploaded = true;
        if ($scope.uploadAreaForm.$valid && $scope.fileCommitted && $scope.fileReadingSuccess){
            var geom;
            if ($scope.format === 'csv'){
                geom = $scope.parseCSV();
            } else if ($scope.format === 'wkt'){
                geom = $scope.parseWKT();
            }
            
            if (angular.isDefined(geom)){
                $modalInstance.close(geom);
            }
        } else {
            $scope.setError();
            $scope.errorMessage = locale.getString('areas.area_upload_modal_form_errors');
        }
    };
    
    //Error functions
    $scope.setError = function(){
        $scope.hasWarning = false;
        $scope.hasError = true;
        $scope.hideError();
    };
    
    $scope.setWarning = function(){
        $scope.hasWarning = true;
        $scope.hasError = true;
        $scope.hideError();
    };
    
    $scope.hideError = function(){
        $timeout(function(){
            $scope.hasError = false;
            $scope.hasWarning = false;
        }, 3000);
    };
    
});