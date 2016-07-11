/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
describe('ManualPosition', function() {

    beforeEach(module('unionvmsWeb'));
        var data = {
            guid : "12345-qwert-12345-asdfg-1qaz2",
            speed : 15,
            course : 34,
            time : "2013-02-08 09:30",
            updatedTime : "",
            status : "",
            state: "DRAFT",

            asset : {
                extMarking : "EXTM",
                cfr : "1111",
                name :"Nova",
                ircs :"222",
                flagState :"Swe"
                },

            position : {
                latitude : 34,
                longitude : 50
            }
        };


     function verifyPosition(position) {
        expect(position.guid).toEqual("12345-qwert-12345-asdfg-1qaz2");
        expect(position.speed).toEqual(15);
        expect(position.course).toEqual(34);
        expect(position.time).toEqual("2013-02-08 09:30");
        expect(position.updatedTime).toEqual("");
        expect(position.status).toEqual("");
        expect(position.state).toEqual("DRAFT");

        expect(position.carrier.externalMarking).toEqual("EXTM");
        expect(position.carrier.cfr).toEqual("1111");

        expect(position.carrier.name).toEqual("Nova");
        expect(position.carrier.ircs).toEqual("222");
        expect(position.carrier.flagState).toEqual("Swe");

        expect(position.position.latitude).toEqual(34);
        expect(position.position.longitude).toEqual(50);
     }

    it('should parse JSON input correctly', inject(function(ManualPosition) {
        verifyPosition(ManualPosition.fromJson(data));
    }));

    it('getDto() should create correct object', inject(function(ManualPosition) {
        var position = ManualPosition.fromJson(data);
        var dto = position.getDto();

        expect(dto.guid).toEqual(data.guid);
        expect(dto.speed).toEqual(data.speed);
        expect(dto.course).toEqual(data.course);
        expect(dto.time).toEqual(data.time);
        expect(dto.updatedTime).toEqual(data.updatedTime);
        expect(dto.status).toEqual(data.status);
        expect(dto.state).toEqual(data.state);

        expect(dto.asset.extMarking).toEqual(data.asset.extMarking);
        expect(dto.asset.cfr).toEqual(data.asset.cfr);

        expect(dto.asset.name).toEqual(data.asset.name);
        expect(dto.asset.ircs).toEqual(data.asset.ircs);
        expect(dto.asset.flagState).toEqual(data.asset.flagState);

        expect(dto.position.latitude).toEqual(data.position.latitude);
        expect(dto.position.longitude).toEqual(data.position.longitude);
    }));

    it('copy() should create a copy of the object', inject(function(ManualPosition) {
        var position = ManualPosition.fromJson(data);
        var copy = position.copy();

        expect(copy.guid).toEqual(position.guid);
        expect(copy.speed).toEqual(position.speed);
        expect(copy.course).toEqual(position.course);
        expect(copy.time).toEqual(position.time);
        expect(copy.updatedTime).toEqual(position.updatedTime);
        expect(copy.status).toEqual(position.status);
        expect(copy.state).toEqual(position.state);

        expect(copy.carrier.externalMarking).toEqual(position.carrier.externalMarking);
        expect(copy.carrier.cfr).toEqual(position.carrier.cfr);

        expect(copy.carrier.name).toEqual(position.carrier.name);
        expect(copy.carrier.ircs).toEqual(position.carrier.ircs);
        expect(copy.carrier.flagState).toEqual(position.carrier.flagState);

        expect(copy.position.latitude).toEqual(position.position.latitude);
        expect(copy.position.longitude).toEqual(position.position.longitude);
    }));
 });