describe('reportService', function () {

    var mockMapService, mockSpatialRestService, mockSpatialHelperService, mockVmsVisibilityService,
        mockReportRestService;

    beforeEach(module('unionvmsWeb'));

    beforeEach(function () {

        mockReportRestService = jasmine.createSpyObj("reportRestService", [ 'executeReport' ]);
        mockVmsVisibilityService = jasmine.createSpyObj("vmsVisibilityService", [ 'setVisibility']);
        mockSpatialHelperService = jasmine.createSpyObj("spatialHelperService", [ 'setToolbarControls']);
        //mockSpatialHelperService.setToolbarControls.andCallFake(function() {});
        mockMapService = jasmine.createSpyObj("mapService", [ 'getLayerByType', 'getControlsByType', 'updateMapView',
            'updateMapControls', 'setPositionStylesObj', 'setSegmentStylesObj', 'setPopupVisibility', 'clearVectorLayers', 'getMapProjectionCode',
            'deactivateVectorLabels', 'setLabelVisibility']);
        mockSpatialRestService = jasmine.createSpyObj("spatialRestService", [ 'getConfigsForReport', 'getConfigsForReportWithoutMap']);

        module(function ($provide) {
            $provide.value('vmsVisibilityService', mockVmsVisibilityService);
            $provide.value('mapService', mockMapService);
            $provide.value('spatialRestService', mockSpatialRestService);
            $provide.value('spatialHelperService', mockSpatialHelperService);
            $provide.value('reportRestService', mockReportRestService);
        });

    });

//    it("testing definition of mocks", inject(function () {
//
////        expect(mockReportRestService.executeReport).toBeDefined();
////        expect(mockVmsVisibilityService.setVisibility).toBeDefined();
////        expect(mockSpatialHelperService.setToolbarControls).toBeDefined();
////        expect(mockMapService.clearVectorLayers).toBeDefined();
////        expect(mockMapService.getLayerByType).toBeDefined();
////        expect(mockMapService.updateMapContainerSize).toBeUndefined(); 
//
//    }));

//    it("testing initialisation of variables from reporting service", inject(function (reportService) {
//
////        expect(reportService.isReportExecuting).toBeFalsy();
////        expect(reportService.hasError).toBeFalsy();
////        expect(reportService.positions).toEqual([]);
////        expect(reportService.segments).toEqual([]);
////        expect(reportService.tracks).toEqual([]);
////        expect(reportService.alarms).toEqual([]);
//        //expect(reportService.tabs.map).toBeTruthy();
//        //expect(reportService.tabs.vms).toBeTruthy();
//
//    }));

//    it("runReport with map with error in spatial rest service call", inject(function (reportService, Report, mapService) {
//
//        var report = new Report();
//        report.id = 1;
//        report.withMap = true;
//        
//        mapService.vmsposLabels = {active: true};
//        mapService.vmssegLabels = {active: true};
//        
//
//        mockSpatialRestService.getConfigsForReport.andCallFake(function () {
//            return {
//                then: function(successFn, errorFn) {
//                },
//                error: function(fn) {
//                }
//            };
//        });
//        
//        reportService.runReport(report);
//        expect(mockMapService.getControlsByType).toHaveBeenCalledWith('HistoryControl');
//
//        expect(mockSpatialRestService.getConfigsForReport).toHaveBeenCalledWith(report.id);
//        expect(mockMapService.clearVectorLayers).toHaveBeenCalled();
//        expect(mockMapService.updateMapView.callCount).toBe(0);
//        expect(mockMapService.updateMapControls.callCount).toBe(0);
//        expect(mockVmsVisibilityService.setVisibility.callCount).toBe(0);
//        expect(mockMapService.setPopupVisibility.callCount).toBe(0);
//        expect(mockSpatialHelperService.setToolbarControls.callCount).toBe(0);
//        expect(mockReportRestService.executeReport.callCount).toBe(0);
//    }));

//    it("runReport with map without errors", inject(function (reportService, Report, mapService) {
//
//        var report = new Report();
//        report.id = 1;
//        report.withMap = true;
//        
//        mapService.vmsposLabels = {active: true};
//        mapService.vmssegLabels = {active: true};
//
//        mockMapService.styles = {
//
//            positions: 'countryCode',
//            segments: 'countryCode'
//        };
//
//        mockReportRestService.executeReport.andCallFake(function () {
//            return {
//                then: function (callback) {
//                    return callback({
//                        'movements': { 'features': [] },
//                        'segments': { 'features': [] }
//                    });
//                }
//            };
//        });
//
//        mockSpatialRestService.getConfigsForReport.andCallFake(function () {
//            return {
//                then: function (callback) {
//                    return callback({
//                        'map': {
//                            'projection': {
//                                'epsgCode': 11
//                            },
//                            'layers': [
//
//                            ]
//                        },
//                        'vectorStyles': {
//                            'positions': {
//                                'epsgCode': 11
//                            }
//                        },
//                        'visibilitySettings': {
//                            'positions': {
//                                'popup': true
//                            },
//                            'segments': {
//                                'popup': true
//                            }
//                        }
//                    });
//                }
//            };
//        });
//
//        reportService.runReport(report);
//
//        expect(report.hasError).toBeFalsy();
//        expect(mockSpatialRestService.getConfigsForReport).toHaveBeenCalledWith(report.id);
//        expect(mockMapService.clearVectorLayers).toHaveBeenCalled();
//        expect(mockMapService.updateMapView).toHaveBeenCalled();
//        expect(mockMapService.updateMapControls).toHaveBeenCalled();
//        expect(mockVmsVisibilityService.setVisibility).toHaveBeenCalled();
//        expect(mockMapService.setPopupVisibility.callCount).toBe(2);
//        expect(mockSpatialHelperService.setToolbarControls).toHaveBeenCalled();
//        expect(mockReportRestService.executeReport).toHaveBeenCalled();
//    }));

//    it("runReport without map", inject(function (reportService, Report, mapService) {
//
//        var report = new Report();
//        report.id = 1;
//        report.withMap = false;
//        
//        mapService.vmsposLabels = {active: true};
//        mapService.vmssegLabels = {active: true};
//
//        mockMapService.styles = {
//            positions: 'countryCode',
//            segments: 'countryCode'
//        };
//        
//        mockSpatialRestService.getConfigsForReportWithoutMap.andCallFake(function () {
//            return {
//                then: function (callback) {
//                    return callback({
//                        'visibilitySettings': {
//                            'positions': {
//                                'popup': true
//                            },
//                            'segments': {
//                                'popup': true
//                            }
//                        }
//                    });
//                }
//            };
//        });
//
//        mockReportRestService.executeReport.andCallFake(function () {
//            return {
//                then: function (callback) {
//                    return callback({
//                        'movements': { 'features': [] },
//                        'segments': { 'features': [] }
//                    });
//                }
//            };
//        });
//        
//
//        reportService.runReport(report);
//
//        expect(mockSpatialRestService.getConfigsForReportWithoutMap).toHaveBeenCalled();
//        expect(mockMapService.clearVectorLayers).toHaveBeenCalled();
//        expect(mockMapService.updateMapView.callCount).toBe(0);
//        expect(mockMapService.updateMapControls.callCount).toBe(0);
//        expect(mockVmsVisibilityService.setVisibility.callCount).toBe(1);
//        expect(mockMapService.setPopupVisibility.callCount).toBe(0);
//        expect(mockSpatialHelperService.setToolbarControls.callCount).toBe(0);
//        expect(mockReportRestService.executeReport).toHaveBeenCalled();
//    }));

});