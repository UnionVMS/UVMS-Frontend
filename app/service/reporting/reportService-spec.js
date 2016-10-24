describe('reportService', function () {
    var rep, repServ, mockRepFormServ, $interval, mockSpRestServ, mockRepRestServ, mockMapServ, mockLayerPanServ, mockNavServ;
    
    beforeEach(module('unionvmsWeb'));
    
    beforeEach(function(){
        mockRepFormServ = {
            liveView: {
                outOfDate: false,
                editable: false
            },
            resetLiveView: function(){
                return 'reseted liveview';
            }
        };
        
        spyOn(mockRepFormServ, 'resetLiveView');
        
        mockSpRestServ = jasmine.createSpyObj('spatialRestService', [ 'getConfigsForReport', 'getConfigsForReportWithoutMap']);
        mockRepRestServ = jasmine.createSpyObj('reportRestService', [ 'executeReport', 'getLastExecuted']);
        mockMapServ = jasmine.createSpyObj('mapService', ['setMap', 'getMapProjectionCode', 'updateMapControls', 'updateMapView', 
                                                          'setPositionStylesObj', 'setSegmentStylesObj', 'setAlarmsStylesObj', 'setPopupVisibility',
                                                          'setLabelVisibility', 'updateMapSize', 'clearVectorLayers', 'resetLabelContainers',
                                                          'setDisplayedFlagStateCodes', 'getControlsByType', 'closePopup', 'deactivateVectorLabels']);
        mockLayerPanServ = jasmine.createSpyObj('layerPanelService', ['updateLayerTreeSource']);
        mockNavServ = jasmine.createSpyObj('reportingNavigatorService', ['goToView', 'isViewVisible']);
        
        module(function($provide){
            $provide.value('reportFormService', mockRepFormServ);
            $provide.value('spatialRestService', mockSpRestServ);
            $provide.value('reportRestService', mockRepRestServ);
            $provide.value('mapService', mockMapServ);
            $provide.value('layerPanelService', mockLayerPanServ);
            $provide.value('reportingNavigatorService', mockNavServ);
        });
    });
    
    beforeEach(inject(function($injector, _$interval_){
        $interval = _$interval_;
        repServ = $injector.get('reportService');
        //We need to mock the following function because it is only defined in mapPanel.js
        repServ.untoggleToolbarBtns = function(){
            return true;
        };
        
        //Define a standard report to be run
        var repModel = $injector.get('Report');
        rep = new repModel();
        
        $httpBackend = $injector.get('$httpBackend');
        
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
        
        $('<div id="map"></div>').appendTo('body');
        
        registerMockData();
    }));
    
    afterEach(function(){
        $('body').remove('#map');
    });
    
    var registerMockData = function(){
        mockSpRestServ.getConfigsForReport.andCallFake(function(){
            return {
                then: function(callback){
                    return callback({
                        'map': {
                            'projection': {
                                'epsgCode': 3857,
                                'units': 'm',
                                'global': true,
                                'extent': '-20026376.39;-20048966.10;20026376.39;20048966.10',
                                'axis': 'enu',
                                'projDef': '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
                                'worldExtent': '-180;-89.99;180;89.99'
                            },
                            'control': [],
                            'tbControl': [],
                            'layers': [],
                        },
                        'vectorStyles': {
                            'positions': {
                                'attribute': 'countryCode',
                                'style': {}
                            },
                            'segments': {
                                'attribute': 'speedOverGround',
                                'style': {}
                            },
                            'alarms': {}
                        },
                        'visibilitySettings': {
                            'positions': {
                                'popup': {
                                    'isAttributeVisible': true,
                                    'order': [],
                                    'values': []
                                },
                                'labels': {
                                    'isAttributeVisible': true,
                                    'order': [],
                                    'values': []
                                },
                                'table': {
                                    'order': [],
                                    'values': []
                                }
                            },
                            'segments': {
                                'popup': {
                                    'isAttributeVisible': true,
                                    'order': [],
                                    'values': []
                                },
                                'labels': {
                                    'isAttributeVisible': true,
                                    'order': [],
                                    'values': []
                                },
                                'table': {
                                    'order': [],
                                    'values': []
                                }
                            }
                        }
                    });
                }
            };
        });
        
        mockSpRestServ.getConfigsForReportWithoutMap.andCallFake(function(){
            return {
                then: function(callback){
                    return callback({
                        'visibilitySettings': {
                            'positions': {
                                'popup': {
                                    'isAttributeVisible': true,
                                    'order': [],
                                    'values': []
                                },
                                'labels': {
                                    'isAttributeVisible': true,
                                    'order': [],
                                    'values': []
                                },
                                'table': {
                                    'order': [],
                                    'values': []
                                }
                            },
                            'segments': {
                                'popup': {
                                    'isAttributeVisible': true,
                                    'order': [],
                                    'values': []
                                },
                                'labels': {
                                    'isAttributeVisible': true,
                                    'order': [],
                                    'values': []
                                },
                                'table': {
                                    'order': [],
                                    'values': []
                                }
                            }
                        }
                    });
                }
            };
        });
        
        mockRepRestServ.executeReport.andCallFake(function(){
            return {
                then: function(callback){
                    return callback({
                        'movements': {
                            'type': 'FeatureCollection',
                            'features': []
                        },
                        'segments': {
                            'type': 'FeatureCollection',
                            'features': []
                        },
                        'tracks': []
                    });
                }
            };
        });
        
        mockRepRestServ.getLastExecuted.andCallFake(function(){
            return {
                then: function(callback){
                    return callback([]);
                }
            };
        });
        
        mockMapServ.getControlsByType.andReturn([{
            control: 'History',
            resetHistory: function(){
                return true;
            }
        }]);
        
        mockMapServ.styles = {
            positions: {},
            segments: {}
        };
        
        mockMapServ.map = {};
        mockMapServ.overlay = {};
        mockMapServ.vmsposLabels = {
            active: true
        };
        mockMapServ.vmssegLabels = {
            active: true
        };
        
        mockMapServ.popupRecContainer = {
            records: []
        };
        
        mockNavServ.isViewVisible.andReturn(true);
    };
    
    it('reportService should be properly initialized', function(){
        expect(repServ).toBeDefined();
        expect(repServ.isReportExecuting).toBeFalsy();
        expect(repServ.hasError).toBeFalsy();
        expect(repServ.positions).toEqual([]);
        expect(repServ.segments).toEqual([]);
        expect(repServ.tracks).toEqual([]);
        expect(repServ.alarms).toEqual([]);
        
        expect(mockSpRestServ.getConfigsForReport).toBeDefined();
        expect(mockSpRestServ.getConfigsForReportWithoutMap).toBeDefined();
        expect(mockRepRestServ.executeReport).toBeDefined();
        expect(mockRepRestServ.getLastExecuted).toBeDefined();
        expect(mockMapServ.setMap).toBeDefined();
        expect(mockMapServ.updateMapView).toBeDefined();
        expect(mockMapServ.getMapProjectionCode).toBeDefined();
        expect(mockMapServ.updateMapControls).toBeDefined();
        expect(mockMapServ.setPositionStylesObj).toBeDefined();
        expect(mockMapServ.setSegmentStylesObj).toBeDefined();
        expect(mockMapServ.setAlarmsStylesObj).toBeDefined();
        expect(mockMapServ.setPopupVisibility).toBeDefined();
        expect(mockMapServ.setLabelVisibility).toBeDefined();
        expect(mockMapServ.updateMapSize).toBeDefined();
        expect(mockMapServ.resetLabelContainers).toBeDefined();
    });
    
    it('should run a saved report with map', function(){
        rep.id = 1;
        rep.withMap = true;
        rep.editable = true;
        repServ.runReport(rep);
        $interval.flush(10);
        
        expect(repServ.hasError).toBeFalsy();
        expect(mockRepFormServ.resetLiveView).toHaveBeenCalled();
        expect(mockSpRestServ.getConfigsForReport).toHaveBeenCalledWith(1, moment.utc().format('YYYY-MM-DDTHH:mm:ss') );
        expect(mockMapServ.resetLabelContainers).toHaveBeenCalled();
        expect(mockMapServ.getControlsByType).toHaveBeenCalledWith('HistoryControl');
        expect(mockMapServ.closePopup).toHaveBeenCalled();
        expect(mockMapServ.deactivateVectorLabels).toHaveBeenCalledWith('vmspos');
        expect(mockMapServ.deactivateVectorLabels).toHaveBeenCalledWith('vmsseg');
        expect(mockMapServ.setMap).not.toHaveBeenCalled();
        expect(mockNavServ.isViewVisible).toHaveBeenCalledWith('mapPanel');
        expect(mockMapServ.updateMapControls).toHaveBeenCalled();
        expect(mockMapServ.setPositionStylesObj).toHaveBeenCalled();
        expect(mockMapServ.setSegmentStylesObj).toHaveBeenCalled();
        expect(mockMapServ.setAlarmsStylesObj).toHaveBeenCalled();
        expect(mockMapServ.setPopupVisibility).toHaveBeenCalled();
        expect(mockMapServ.setLabelVisibility).toHaveBeenCalled();
        expect(mockMapServ.updateMapSize).toHaveBeenCalled();
        expect(mockRepRestServ.executeReport).toHaveBeenCalled();
        expect(mockRepRestServ.getLastExecuted).toHaveBeenCalledWith(10);
    });
    
    it('should run a saved report with map after a previous report has been executed', function(){
        rep.id = 1;
        rep.withMap = true;
        rep.editable = true;
        repServ.runReport(rep);
        mockRepFormServ.liveView.currentReport = rep;
        $interval.flush(10);
        
        mockMapServ.styles = {
            positions: {
                attribute: 'countryCode'
            },
            segments: {
                attribute: 'speedOverGround'
            }
        };
        
        rep.id = 2;
        repServ.runReport(rep);
        $interval.flush(10);
        
        expect(repServ.hasError).toBeFalsy();
        expect(mockRepFormServ.resetLiveView.callCount).toBe(2);
        expect(mockSpRestServ.getConfigsForReport.callCount).toBe(2);
        expect(mockMapServ.resetLabelContainers.callCount).toBe(2);
        expect(mockMapServ.setMap.callCount).toBe(0);
        expect(mockNavServ.isViewVisible.callCount).toBe(3);
        expect(mockMapServ.updateMapControls.callCount).toBe(1);
        expect(mockMapServ.setDisplayedFlagStateCodes.callCount).toBe(1);
        expect(mockMapServ.setPositionStylesObj.callCount).toBe(1);
        expect(mockMapServ.setSegmentStylesObj.callCount).toBe(1);
        expect(mockMapServ.setAlarmsStylesObj.callCount).toBe(1);
        expect(mockMapServ.setPopupVisibility.callCount).toBe(2);
        expect(mockMapServ.setLabelVisibility.callCount).toBe(2);
        expect(mockMapServ.updateMapSize.callCount).toBe(1);
        expect(mockRepRestServ.executeReport.callCount).toBe(2);
        expect(mockRepRestServ.getLastExecuted.callCount).toBe(2);
    });
    
    it('should run a saved report without map', function(){
        rep.id = 1;
        rep.withMap = false;
        repServ.runReport(rep);
        $interval.flush(10);
        
        expect(repServ.hasError).toBeFalsy();
        expect(mockRepFormServ.resetLiveView).toHaveBeenCalled();
        expect(mockSpRestServ.getConfigsForReportWithoutMap).toHaveBeenCalledWith(moment.utc().format('YYYY-MM-DDTHH:mm:ss'));
        expect(mockMapServ.resetLabelContainers).toHaveBeenCalled();
        expect(mockMapServ.setMap).not.toHaveBeenCalled();
        expect(mockNavServ.isViewVisible).toHaveBeenCalledWith('mapPanel');
        expect(mockMapServ.updateMapControls).not.toHaveBeenCalled();
        expect(mockMapServ.setPositionStylesObj).not.toHaveBeenCalled();
        expect(mockMapServ.setSegmentStylesObj).not.toHaveBeenCalled();
        expect(mockMapServ.setAlarmsStylesObj).not.toHaveBeenCalled();
        expect(mockMapServ.setPopupVisibility).not.toHaveBeenCalled();
        expect(mockMapServ.setLabelVisibility).not.toHaveBeenCalled();
        expect(mockMapServ.updateMapSize).not.toHaveBeenCalled();
        
        expect(mockRepRestServ.executeReport).toHaveBeenCalled();
        expect(mockRepRestServ.getLastExecuted).toHaveBeenCalledWith(10);
    });
    
    it('should be possible to reset a report reference within the service', function(){
        rep.id = 1;
        rep.withMap = false;
        repServ.runReport(rep);
        $interval.flush(10);
        
        repServ.positions = [1,2,3];
        repServ.segments = [1,2,3];
        repServ.tracks = [1,2,3];
        repServ.alarms = [1,2,3];
        
        repServ.resetReport();
        
        
        expect(repServ.id).toBeUndefined();
        expect(repServ.positions).toEqual([]);
        expect(repServ.segments).toEqual([]);
        expect(repServ.tracks).toEqual([]);
        expect(repServ.alarms).toEqual([]);
        expect(mockRepFormServ.resetLiveView).toHaveBeenCalled();
        expect(mockLayerPanServ.updateLayerTreeSource).toHaveBeenCalled();
        expect(mockNavServ.isViewVisible).toHaveBeenCalledWith('mapPanel');
    });
    
    it('should run a report with unsaved configurations', function(){
        rep.id = 1;
        rep.withMap = true;
        repServ.runReport(rep);
        $interval.flush(10);
        
        mockRepFormServ.liveView.currentReport = rep;
        mockRepFormServ.liveView.currentReport.withMap = false;
        
        repServ.runReportWithoutSaving(mockRepFormServ.liveView.currentReport);
        
        mockRepFormServ.liveView.currentReport.withMap = true;
        repServ.runReportWithoutSaving(mockRepFormServ.liveView.currentReport);
        
        expect(repServ.id).toBe(1);
        expect(mockNavServ.isViewVisible).toHaveBeenCalledWith('mapPanel');
        expect(mockNavServ.goToView.callCount).toBe(3);
    });
    
    describe('should refresh a previously executed report', function(){
        beforeEach(function(){
            rep.id = 1;
            rep.withMap = true;
            repServ.runReport(rep);
            $interval.flush(10);
        });
        
        it('should untoggle toolbar buttons', function(){
            spyOn(repServ, 'untoggleToolbarBtns');
            repServ.refreshReport();
            expect(repServ.untoggleToolbarBtns).toHaveBeenCalled();
        });
        
        
        it('should clear map overlays', function(){
            spyOn(repServ, 'clearMapOverlaysOnRefresh');
            repServ.refreshReport();
            expect(repServ.clearMapOverlaysOnRefresh).toHaveBeenCalled();
        });
        
        it('should run the report again', function(){
            spyOn(repServ, 'runReport');
            repServ.refreshReport();
            
            expect(repServ.runReport).toHaveBeenCalled();
        });
        
        it('should run an out of date report', function(){
            spyOn(repServ, 'runReportWithoutSaving');
            mockRepFormServ.liveView.outOfDate = true;
            repServ.refreshReport();
            
            expect(repServ.runReportWithoutSaving).toHaveBeenCalled();
        });
    });
    

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
//        expect(mockVisibilityService.setVisibility.callCount).toBe(0);
//        expect(mockMapService.setPopupVisibility.callCount).toBe(0);
//        expect(mockSpatialHelperService.setToolbarControls.callCount).toBe(0);
//        expect(mockReportRestService.executeReport.callCount).toBe(0);
//    }));

//    


});