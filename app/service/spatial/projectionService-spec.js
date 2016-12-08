/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
describe('projectionService', function() {
    var projServ, spRestSpy, genMapServ, $interval;
    beforeEach(module('unionvmsWeb'));
    
    beforeEach(function(){
        spRestSpy = jasmine.createSpyObj('spatialRestService', ['getSupportedProjections']);
        genMapServ = jasmine.createSpyObj('genericMapService', ['registerProjInProj4']);
        
        module(function($provide){
            $provide.value('spatialRestService', spRestSpy);
            $provide.value('genericMapService', genMapServ);
        });
    });
  
    beforeEach(inject(function(projectionService, $httpBackend, _$interval_){
        $interval = _$interval_;
        projServ = projectionService;
        buildMocks();
        
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));
    
    function buildMocks(){
        spRestSpy.getSupportedProjections.andCallFake(function(){
            return {
                then: function(callback){
                    return callback(getProjArray());
                }
            };
        });
    }
    
    it('should get local spherical mercator projection object', function() {
        var projFromServ = projServ.getStaticProjMercator();
        
        var expectedProjObj = {
            axis: 'enu',
            epsgCode : 3857,
            extent : '-20026376.39;-20048966.10;20026376.39;20048966.10',
            formats : 'm',
            global : true,
            name : 'Spherical Mercator',
            units : 'm'
        }; 
            
        expect(projFromServ).toEqual(expectedProjObj);
    });
    
    it('should get projections from server and porperly process them', function(){
        projServ.getProjections();
        
        expect(projServ.isLoaded).toBeTruthy();
        expect(projServ.isLoading).toBeFalsy();
        expect(projServ.srcProjections).toEqual(getProjArray());
        expect(projServ.items.length).toBe(2);
        expect(projServ.items).toEqual(getProjObjForCombo());
        expect(genMapServ.registerProjInProj4.callCount).toBe(2);
    });
    
    it('should get projections only if the service didn\'t yet loaded or is not currently loading', function(){
        spyOn(projServ, 'setProjectionItems');
        projServ.isLoaded = true;
        projServ.getProjections();
        
        expect(projServ.setProjectionItems).not.toHaveBeenCalled();
    });
    
    it('should set the coordinate units items', function(){
        projServ.setProjectionItems(true, 2);
        var expectedUnits = [{
            text: '',
            code: 'dd'
        },{
            text: '',
            code: 'dms'
        },{
            text: '',
            code: 'ddm'
        }];
        
        expect(projServ.coordinatesFormatItems.length).toBe(3);
        expect(projServ.coordinatesFormatItems).toEqual(expectedUnits);
    });
    
    it('should clear the coordinate unit items', function(){
        projServ.setProjectionItems(true, 2);
        projServ.clearCoordinatesUnitItems();
        
        expect(projServ.coordinatesFormatItems).toEqual(jasmine.any(Array));
        expect(projServ.coordinatesFormatItems.length).toBe(0);
    });
    
    it('should get projection id by EPSG code (4326)', function(){
        projServ.getProjections();
        var proj = projServ.getProjectionIdByEpsg('4326');
        
        expect(proj).toEqual(2);
    });
    
    it('should get projection id by EPSG code (EPSG:4326)', function(){
        projServ.getProjections();
        var proj = projServ.getProjectionIdByEpsg('EPSG:4326');
        
        expect(proj).toEqual(2);
    });
    
    it('should retrieve undefined if there are no projections in the service', function(){
        var proj = projServ.getProjectionIdByEpsg('4326');
        
        expect(proj).not.toBeDefined();
    });
    
    it('should get the projection EPSG code by local projection id', function(){
        projServ.getProjections();
        var proj = projServ.getProjectionEpsgById(1);
        
        expect(proj).toEqual(3857);
    });
    
    it('should retrieve undefined if there are no projections in the service', function(){
        var proj = projServ.getProjectionEpsgById(1);
        
        expect(proj).not.toBeDefined();
    });
    
    it('should retrieve undefined if the projection id doesn\'t exist', function(){
        projServ.getProjections();
        var proj = projServ.getProjectionEpsgById(4);
        
        expect(proj).not.toBeDefined();
    });
    
    it('should get the projection object by the EPSG code (4326)', function(){
        projServ.getProjections();
        var proj = projServ.getFullProjByEpsg('4326');
        
        expect(proj).toEqual(projServ.srcProjections[1]);
    });
    
    it('should get the projection object by the EPSG code (EPSG:3857)', function(){
        projServ.getProjections();
        var proj = projServ.getFullProjByEpsg('EPSG:3857');
        
        expect(proj).toEqual(projServ.srcProjections[0]);
    });
    
    it('should retrieve undefined if there no projections in the service', function(){
        var proj = projServ.getFullProjByEpsg('3857');
        
        expect(proj).not.toBeDefined();
    });
    
    it('should retrieve undefined if EPSG code is not available in the service', function(){
        projServ.getProjections();
        var proj = projServ.getFullProjByEpsg('7777');
        
        expect(proj).not.toBeDefined();
    });
    
    it('should set projection and coordinates in lazy mode when isLoaded is false and isLoading is false', function(){
        projServ.setLazyProjectionAndCoordinates(2);
        
        expect(projServ.isLoaded).toBeTruthy();
        expect(projServ.isLoading).toBeFalsy();
        expect(projServ.srcProjections).toEqual(getProjArray());
        expect(projServ.items.length).toBe(2);
        expect(projServ.items).toEqual(getProjObjForCombo());
        expect(genMapServ.registerProjInProj4.callCount).toBe(2);
    });
    
    it('should set projection and coordinates in lazy mode when isLoaded is false and isLoading is true', function(){
        var expectedUnits = [{
            text: '',
            code: 'dd'
        },{
            text: '',
            code: 'dms'
        },{
            text: '',
            code: 'ddm'
        }];
        
        projServ.isLoading = true;
        projServ.setLazyProjectionAndCoordinates(2);
        $interval.flush(1);
        
        expect(projServ.isLoaded).toBeFalsy();
        expect(projServ.isLoading).toBeTruthy();
        
        projServ.setProjectionItems();
        $interval.flush(1);
        
        expect(projServ.isLoaded).toBeTruthy();
        expect(projServ.isLoading).toBeFalsy();
        expect(projServ.coordinatesFormatItems.length).toBe(3);
        expect(projServ.coordinatesFormatItems).toEqual(expectedUnits);
    });
    
    it('should set projection and coordinates in lazy mode when isLloaded is true', function(){
        var expectedUnits = [{
            text: '',
            code: 'dd'
        },{
            text: '',
            code: 'dms'
        },{
            text: '',
            code: 'ddm'
        }];
        
        projServ.isLoaded = true;
        projServ.setLazyProjectionAndCoordinates(2);
        $interval.flush(1);
        
        expect(projServ.isLoaded).toBeTruthy();
        expect(projServ.isLoading).toBeFalsy();
        
        projServ.setProjectionItems();
        $interval.flush(1);
        
        expect(projServ.isLoaded).toBeTruthy();
        expect(projServ.isLoading).toBeFalsy();
        expect(projServ.coordinatesFormatItems.length).toBe(3);
        expect(projServ.coordinatesFormatItems).toEqual(expectedUnits);
    });
    
    function getProjArray(){
        return [{
            axis: 'enu',
            epsgCode: 3857,
            extent: '-20026376.39;-20048966.10;20026376.39;20048966.10',
            formats: 'm',
            global: true,
            id: 1,
            name: 'Spherical Mercator',
            projDef: '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
            units: 'm',
            worldExtent: '-180;-89.99;180;89.99'
        },{
            axis: 'neu',
            epsgCode: 4326,
            extent: '-180;-90;180;90',
            formats: 'dd;dms;ddm',
            global: true,
            id: 2,
            name: 'WGS 84',
            projDef: '+proj=longlat +datum=WGS84 +no_defs',
            units: 'm',
            worldExtent: '-180;-90;180;90'
        }];
    }
    
    function getProjObjForCombo(){
        var proj = getProjArray();
        var finalArray = [];
        for (var i = 0; i < proj.length; i++){
            finalArray.push({
                "text": proj[i].name,
                "code": proj[i].id
            });
        }
        return finalArray;
    }

});
